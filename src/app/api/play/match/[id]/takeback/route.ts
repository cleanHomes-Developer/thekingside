import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";
import { buildMatchSnapshot } from "@/lib/play/match";
import { publishPlayStream } from "@/lib/play/stream";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { rateLimit } from "@/lib/rate-limit";

const GUEST_COOKIE = "tks_guest";

type Params = {
  params: { id: string };
};

async function getPlayerId() {
  const session = await getSessionFromCookies();
  if (session?.sub) {
    const player = await prisma.casualPlayer.findUnique({
      where: { userId: session.sub },
    });
    return player?.id ?? null;
  }

  const guestKey = cookies().get(GUEST_COOKIE)?.value;
  if (!guestKey) {
    return null;
  }
  const player = await prisma.casualPlayer.findUnique({ where: { guestKey } });
  return player?.id ?? null;
}

export async function POST(request: NextRequest, { params }: Params) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const limit = rateLimit(request, {
    keyPrefix: "play:takeback",
    windowMs: 60_000,
    max: 30,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": limit.retryAfter.toString() } },
    );
  }
  const playerId = await getPlayerId();
  if (!playerId) {
    return NextResponse.json({ error: "Player not found" }, { status: 401 });
  }

  const match = await prisma.casualMatch.findUnique({
    where: { id: params.id },
    include: { moves: { orderBy: { ply: "desc" }, take: 1 } },
  });

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (match.status !== "IN_PROGRESS") {
    return NextResponse.json(
      { error: "Match already completed" },
      { status: 400 },
    );
  }

  const lastMove = match.moves[0];
  if (!lastMove) {
    return NextResponse.json(
      { error: "No moves to take back" },
      { status: 400 },
    );
  }

  if (match.takebackOfferedById && match.takebackOfferedById !== playerId) {
    await prisma.$transaction(async (tx) => {
      await tx.casualMove.delete({ where: { id: lastMove.id } });
      await tx.casualMatch.update({
        where: { id: match.id },
        data: {
          status: "IN_PROGRESS",
          result: null,
          completedAt: null,
          ratingChangeWhite: null,
          ratingChangeBlack: null,
          drawOfferedById: null,
          drawOfferedAt: null,
          takebackOfferedById: null,
          takebackOfferedAt: null,
        },
      });
    });

    publishPlayStream();
    const snapshot = await buildMatchSnapshot(match.id);
    return NextResponse.json({ match: snapshot });
  }

  if (match.takebackOfferedById === playerId) {
    return NextResponse.json(
      { error: "Take back offer already sent" },
      { status: 400 },
    );
  }

  const lastMoveColor = lastMove.ply % 2 === 1 ? "WHITE" : "BLACK";
  const isWhite = match.playerWhiteId === playerId;
  const isBlack = match.playerBlackId === playerId;
  const canUndo =
    (lastMoveColor === "WHITE" && isWhite) ||
    (lastMoveColor === "BLACK" && isBlack);

  if (!canUndo) {
    return NextResponse.json(
      { error: "You can only request a take back on your last move" },
      { status: 403 },
    );
  }

  await prisma.casualMatch.update({
    where: { id: match.id },
    data: {
      takebackOfferedById: playerId,
      takebackOfferedAt: new Date(),
    },
  });

  publishPlayStream();
  const snapshot = await buildMatchSnapshot(match.id);
  return NextResponse.json({ match: snapshot });
}
