import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";
import { calculateEloDelta } from "@/lib/play/ratings";
import { buildMatchSnapshot } from "@/lib/play/match";
import { publishPlayStream } from "@/lib/play/stream";
import { evaluateMasteryForMatch } from "@/lib/mastery/evaluate";

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

export async function POST(_request: Request, { params }: Params) {
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

  const isParticipant =
    match.playerWhiteId === playerId || match.playerBlackId === playerId;
  if (!isParticipant) {
    return NextResponse.json({ error: "Not your match" }, { status: 403 });
  }

  if (match.drawOfferedById && match.drawOfferedById !== playerId) {
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
        "DRAW",
      );

      await tx.casualMatch.update({
        where: { id: match.id },
        data: {
          status: "COMPLETED",
          result: "DRAW",
          completedAt: new Date(),
          ratingChangeWhite: deltas.whiteDelta,
          ratingChangeBlack: deltas.blackDelta,
          drawOfferedById: null,
          drawOfferedAt: null,
          takebackOfferedById: null,
          takebackOfferedAt: null,
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

  if (match.drawOfferedById === playerId) {
    return NextResponse.json({ error: "Draw offer already sent" }, { status: 400 });
  }

  await prisma.casualMatch.update({
    where: { id: match.id },
    data: {
      drawOfferedById: playerId,
      drawOfferedAt: new Date(),
    },
  });

  publishPlayStream();
  const snapshot = await buildMatchSnapshot(match.id);
  return NextResponse.json({ match: snapshot });
}
