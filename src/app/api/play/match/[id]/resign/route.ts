import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";
import { calculateEloDelta } from "@/lib/play/ratings";
import { buildMatchSnapshot } from "@/lib/play/match";
import { publishPlayStream } from "@/lib/play/stream";
import { evaluateMasteryForMatch } from "@/lib/mastery/evaluate";
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
    keyPrefix: "play:resign",
    windowMs: 60_000,
    max: 20,
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
    include: { playerWhite: true, playerBlack: true },
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

  let result: "WHITE" | "BLACK";
  if (match.playerWhiteId === playerId) {
    result = "BLACK";
  } else if (match.playerBlackId === playerId) {
    result = "WHITE";
  } else {
    return NextResponse.json({ error: "Not your match" }, { status: 403 });
  }

  await prisma.$transaction(async (tx) => {
    const fresh = await tx.casualMatch.findUnique({
      where: { id: match.id },
      include: { playerWhite: true, playerBlack: true },
    });
    if (!fresh || fresh.status !== "IN_PROGRESS") {
      return;
    }

    const deltas = calculateEloDelta(
      fresh.playerWhite.rating,
      fresh.playerBlack.rating,
      result,
    );

    await tx.casualMatch.update({
      where: { id: match.id },
      data: {
        status: "COMPLETED",
        result,
        completedAt: new Date(),
        ratingChangeWhite: deltas.whiteDelta,
        ratingChangeBlack: deltas.blackDelta,
      },
    });

    await tx.casualPlayer.update({
      where: { id: fresh.playerWhiteId },
      data: { rating: fresh.playerWhite.rating + deltas.whiteDelta },
    });

    await tx.casualPlayer.update({
      where: { id: fresh.playerBlackId },
      data: { rating: fresh.playerBlack.rating + deltas.blackDelta },
    });
  });

  publishPlayStream();
  await evaluateMasteryForMatch(match.id);
  const snapshot = await buildMatchSnapshot(match.id);
  return NextResponse.json({ match: snapshot });
}
