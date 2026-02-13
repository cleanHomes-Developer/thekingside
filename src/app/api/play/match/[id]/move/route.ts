import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Chess } from "chess.js";
import { prisma } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth/session";
import { calculateEloDelta } from "@/lib/play/ratings";
import { buildMatchSnapshot } from "@/lib/play/match";
import { publishPlayStream } from "@/lib/play/stream";
import { evaluateMasteryForMatch } from "@/lib/mastery/evaluate";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { rateLimit } from "@/lib/rate-limit";
import { computeRemainingTimes } from "@/lib/play/time";
import { Prisma } from "@prisma/client";

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

export async function POST(request: NextRequest, { params }: Params) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const limit = rateLimit(request, {
    keyPrefix: "play:move",
    windowMs: 60_000,
    max: 120,
  });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": limit.retryAfter.toString() } },
    );
  }

  let payload: MovePayload;
  try {
    payload = (await request.json()) as MovePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const playerId = await getPlayerId();
  if (!playerId) {
    return NextResponse.json({ error: "Player not found" }, { status: 401 });
  }

  let completedByTimeout = false;
  let finalResult: "WHITE" | "BLACK" | "DRAW" | null = null;

  try {
    const transactionResult = await prisma.$transaction(async (tx) => {
      const match = await tx.casualMatch.findUnique({
        where: { id: params.id },
        include: { moves: { orderBy: { ply: "asc" } }, playerWhite: true, playerBlack: true },
      });

      if (!match) {
        return { error: "Match not found", status: 404 } as const;
      }
      if (match.status !== "IN_PROGRESS") {
        return { error: "Match already completed", status: 400 } as const;
      }

      const isWhite = match.playerWhiteId === playerId;
      const isBlack = match.playerBlackId === playerId;
      if (!isWhite && !isBlack) {
        return { error: "Not your match", status: 403 } as const;
      }

      const timing = computeRemainingTimes(
        match.startedAt,
        match.moves,
        match.timeControl,
        new Date(),
      );

      const expectedTurn = timing.turn === "w" ? "WHITE" : "BLACK";
      if ((expectedTurn === "WHITE" && !isWhite) || (expectedTurn === "BLACK" && !isBlack)) {
        return { error: "Not your turn", status: 400 } as const;
      }

      const remainingMs = timing.turn === "w" ? timing.whiteMs : timing.blackMs;
      if (remainingMs <= 0) {
        const result = timing.turn === "w" ? "BLACK" : "WHITE";
        const deltas = calculateEloDelta(
          match.playerWhite.rating,
          match.playerBlack.rating,
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
          where: { id: match.playerWhiteId },
          data: { rating: match.playerWhite.rating + deltas.whiteDelta },
        });

        await tx.casualPlayer.update({
          where: { id: match.playerBlackId },
          data: { rating: match.playerBlack.rating + deltas.blackDelta },
        });

        return { matchId: match.id, result, timedOut: true } as const;
      }

      const game = new Chess();
      match.moves.forEach((move) => {
        game.move(move.san);
      });

      const move = game.move({
        from: payload.from,
        to: payload.to,
        promotion: payload.promotion,
      });

      if (!move) {
        return { error: "Illegal move", status: 400 } as const;
      }

      const ply = match.moves.length + 1;
      await tx.casualMove.create({
        data: {
          matchId: match.id,
          ply,
          san: move.san,
          uci: `${move.from}${move.to}${move.promotion ?? ""}`,
          fen: game.fen(),
        },
      });

      if (match.drawOfferedById || match.takebackOfferedById) {
        await tx.casualMatch.update({
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
        const deltas = calculateEloDelta(
          match.playerWhite.rating,
          match.playerBlack.rating,
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
          where: { id: match.playerWhiteId },
          data: { rating: match.playerWhite.rating + deltas.whiteDelta },
        });

        await tx.casualPlayer.update({
          where: { id: match.playerBlackId },
          data: { rating: match.playerBlack.rating + deltas.blackDelta },
        });
      }

      return { matchId: match.id, result, timedOut: false } as const;
    });

    if ("error" in transactionResult) {
      return NextResponse.json(
        { error: transactionResult.error },
        { status: transactionResult.status },
      );
    }

    completedByTimeout = Boolean(transactionResult.timedOut);
    finalResult = transactionResult.result ?? null;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Move already recorded" }, { status: 409 });
    }
    throw error;
  }

  publishPlayStream();
  if (finalResult || completedByTimeout) {
    await evaluateMasteryForMatch(params.id);
  }
  const snapshot = await buildMatchSnapshot(params.id);
  return NextResponse.json({ match: snapshot });
}
