import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Chess } from "chess.js";
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

type MovePayload = {
  from: string;
  to: string;
  promotion?: string;
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

export async function POST(request: Request, { params }: Params) {
  const payload = (await request.json()) as MovePayload;
  const playerId = await getPlayerId();
  if (!playerId) {
    return NextResponse.json({ error: "Player not found" }, { status: 401 });
  }

  const match = await prisma.casualMatch.findUnique({
    where: { id: params.id },
    include: { moves: { orderBy: { ply: "asc" } } },
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

  const isWhite = match.playerWhiteId === playerId;
  const isBlack = match.playerBlackId === playerId;
  if (!isWhite && !isBlack) {
    return NextResponse.json({ error: "Not your match" }, { status: 403 });
  }

  const game = new Chess();
  match.moves.forEach((move) => {
    game.move(move.san);
  });

  const expectedTurn = game.turn() === "w" ? "WHITE" : "BLACK";
  if ((expectedTurn === "WHITE" && !isWhite) || (expectedTurn === "BLACK" && !isBlack)) {
    return NextResponse.json({ error: "Not your turn" }, { status: 400 });
  }

  const move = game.move({
    from: payload.from,
    to: payload.to,
    promotion: payload.promotion,
  });

  if (!move) {
    return NextResponse.json({ error: "Illegal move" }, { status: 400 });
  }

  const ply = match.moves.length + 1;
  await prisma.casualMove.create({
    data: {
      matchId: match.id,
      ply,
      san: move.san,
      uci: `${move.from}${move.to}${move.promotion ?? ""}`,
      fen: game.fen(),
    },
  });

  if (match.drawOfferedById || match.takebackOfferedById) {
    await prisma.casualMatch.update({
      where: { id: match.id },
      data: {
        drawOfferedById: null,
        drawOfferedAt: null,
        takebackOfferedById: null,
        takebackOfferedAt: null,
      },
    });
  }

  let result: "WHITE" | "BLACK" | "DRAW" | null = null;
  if (game.isCheckmate()) {
    result = expectedTurn;
  } else if (game.isDraw()) {
    result = "DRAW";
  }

  if (result) {
    await prisma.$transaction(async (tx) => {
      const freshMatch = await tx.casualMatch.findUnique({
        where: { id: match.id },
        include: { playerWhite: true, playerBlack: true },
      });
      if (!freshMatch || freshMatch.status !== "IN_PROGRESS") {
        return;
      }

      const deltas = calculateEloDelta(
        freshMatch.playerWhite.rating,
        freshMatch.playerBlack.rating,
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
        where: { id: freshMatch.playerWhiteId },
        data: { rating: freshMatch.playerWhite.rating + deltas.whiteDelta },
      });

      await tx.casualPlayer.update({
        where: { id: freshMatch.playerBlackId },
        data: { rating: freshMatch.playerBlack.rating + deltas.blackDelta },
      });
    });
  }

  publishPlayStream();
  if (result) {
    await evaluateMasteryForMatch(match.id);
  }
  const snapshot = await buildMatchSnapshot(match.id);
  return NextResponse.json({ match: snapshot });
}
