import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";
import { buildMatchSnapshot } from "@/lib/play/match";
import { publishPlayStream } from "@/lib/play/stream";

const GUEST_COOKIE = "tks_guest";
const DEFAULT_RATING = 1200;
const BASE_RANGE = 200;
const EXPANDED_RANGE = 400;
const EXPAND_AFTER_MS = 60_000;
const ALLOWED_TIME_CONTROLS = new Set([
  "1+0",
  "1+1",
  "2+1",
  "3+0",
  "3+2",
  "5+0",
  "10+0",
  "15+10",
  "30+0",
]);

function makeGuestName(guestKey: string) {
  return `Guest ${guestKey.slice(0, 4).toUpperCase()}`;
}

async function getOrCreatePlayer() {
  const session = await getSessionFromCookies();
  if (session?.sub) {
    const user = await prisma.user.findUnique({ where: { id: session.sub } });
    if (!user) {
      return null;
    }
    return prisma.casualPlayer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: user.displayName,
        rating: DEFAULT_RATING,
      },
    });
  }

  const guestKey = cookies().get(GUEST_COOKIE)?.value;
  if (!guestKey) {
    return null;
  }

  return prisma.casualPlayer.upsert({
    where: { guestKey },
    update: {},
    create: {
      guestKey,
      displayName: makeGuestName(guestKey),
      rating: DEFAULT_RATING,
    },
  });
}

function resolveRange(queuedAt: Date) {
  const waited = Date.now() - queuedAt.getTime();
  return waited > EXPAND_AFTER_MS ? EXPANDED_RANGE : BASE_RANGE;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const requestedTimeControlRaw =
    body && typeof body.timeControl === "string" ? body.timeControl : "3+0";
  const requestedTimeControl = ALLOWED_TIME_CONTROLS.has(requestedTimeControlRaw)
    ? requestedTimeControlRaw
    : "3+0";
  const player = await getOrCreatePlayer();
  if (!player) {
    return NextResponse.json(
      { error: "Player not available" },
      { status: 400 },
    );
  }

  const existingMatch = await prisma.casualMatch.findFirst({
    where: {
      status: "IN_PROGRESS",
      OR: [
        { playerWhiteId: player.id },
        { playerBlackId: player.id },
      ],
    },
    orderBy: { startedAt: "desc" },
  });
  if (existingMatch) {
    const snapshot = await buildMatchSnapshot(existingMatch.id);
    return NextResponse.json({ match: snapshot, queue: null });
  }

  const existingQueue = await prisma.casualQueueEntry.findFirst({
    where: { playerId: player.id, status: "QUEUED" },
    orderBy: { queuedAt: "desc" },
  });
  let queueEntry = existingQueue;
  if (queueEntry && queueEntry.timeControl !== requestedTimeControl) {
    queueEntry = await prisma.casualQueueEntry.update({
      where: { id: queueEntry.id },
      data: {
        timeControl: requestedTimeControl,
        ratingSnapshot: player.rating,
        queuedAt: new Date(),
      },
    });
  }
  if (!queueEntry) {
    queueEntry = await prisma.casualQueueEntry.create({
      data: {
        playerId: player.id,
        ratingSnapshot: player.rating,
        status: "QUEUED",
        timeControl: requestedTimeControl,
      },
    });
  }

  const candidates = await prisma.casualQueueEntry.findMany({
    where: {
      status: "QUEUED",
      playerId: { not: player.id },
      timeControl: queueEntry.timeControl,
    },
    include: { player: true },
    orderBy: { queuedAt: "asc" },
    take: 25,
  });

  const range = resolveRange(queueEntry.queuedAt);
  const eligible = candidates
    .map((candidate) => {
      const candidateRange = resolveRange(candidate.queuedAt);
      const diff = Math.abs(candidate.ratingSnapshot - player.rating);
      if (diff > range || diff > candidateRange) {
        return null;
      }
      return { candidate, diff };
    })
    .filter(
      (item): item is { candidate: (typeof candidates)[number]; diff: number } =>
        Boolean(item),
    )
    .sort((a, b) => a.diff - b.diff);

  const opponent = eligible[0]?.candidate;
  if (!opponent) {
    return NextResponse.json({
      queue: {
        id: queueEntry.id,
        status: queueEntry.status,
        queuedAt: queueEntry.queuedAt.toISOString(),
        timeControl: queueEntry.timeControl,
      },
    });
  }

  const created = await prisma.$transaction(async (tx) => {
    const freshSelf = await tx.casualQueueEntry.findUnique({
      where: { id: queueEntry.id },
    });
    const freshOpponent = await tx.casualQueueEntry.findUnique({
      where: { id: opponent.id },
    });

    if (
      freshSelf?.status !== "QUEUED" ||
      freshOpponent?.status !== "QUEUED"
    ) {
      return null;
    }

    const assignWhite = Math.random() > 0.5;
    const match = await tx.casualMatch.create({
      data: {
        playerWhiteId: assignWhite ? player.id : opponent.playerId,
        playerBlackId: assignWhite ? opponent.playerId : player.id,
        status: "IN_PROGRESS",
        timeControl: queueEntry.timeControl,
        startedAt: new Date(),
      },
    });

    await tx.casualQueueEntry.update({
      where: { id: queueEntry.id },
      data: {
        status: "MATCHED",
        matchedAt: new Date(),
        matchId: match.id,
      },
    });
    await tx.casualQueueEntry.update({
      where: { id: opponent.id },
      data: {
        status: "MATCHED",
        matchedAt: new Date(),
        matchId: match.id,
      },
    });

    return match;
  });

  if (!created) {
    return NextResponse.json({
      queue: {
        id: queueEntry.id,
        status: queueEntry.status,
        queuedAt: queueEntry.queuedAt.toISOString(),
        timeControl: queueEntry.timeControl,
      },
    });
  }

  const snapshot = await buildMatchSnapshot(created.id);
  publishPlayStream();
  return NextResponse.json({ match: snapshot, queue: null });
}

export async function DELETE() {
  const player = await getOrCreatePlayer();
  if (!player) {
    return NextResponse.json(
      { error: "Player not available" },
      { status: 400 },
    );
  }

  await prisma.casualQueueEntry.updateMany({
    where: { playerId: player.id, status: "QUEUED" },
    data: { status: "LEFT" },
  });

  publishPlayStream();
  return NextResponse.json({ ok: true });
}
