import { Chess } from "chess.js";
import { prisma } from "@/lib/db";

type MatchSnapshot = {
  id: string;
  status: string;
  result: string | null;
  timeControl: string;
  startedAt: string;
  completedAt: string | null;
  white: {
    id: string;
    name: string;
    rating: number;
  };
  black: {
    id: string;
    name: string;
    rating: number;
  };
  fen: string;
  turn: "w" | "b";
  moves: Array<{
    ply: number;
    san: string;
    createdAt: string;
  }>;
  drawOffer: {
    byId: string;
    byName: string;
    at: string;
  } | null;
  takebackOffer: {
    byId: string;
    byName: string;
    at: string;
  } | null;
};

export async function buildMatchSnapshot(
  matchId: string,
): Promise<MatchSnapshot | null> {
  const match = await prisma.casualMatch.findUnique({
    where: { id: matchId },
    include: {
      playerWhite: true,
      playerBlack: true,
      moves: { orderBy: { ply: "asc" } },
    },
  });

  if (!match) {
    return null;
  }

  const game = new Chess();
  match.moves.forEach((move) => {
    game.move(move.san);
  });

  return {
    id: match.id,
    status: match.status,
    result: match.result ?? null,
    timeControl: match.timeControl,
    startedAt: match.startedAt.toISOString(),
    completedAt: match.completedAt?.toISOString() ?? null,
    white: {
      id: match.playerWhite.id,
      name: match.playerWhite.displayName,
      rating: match.playerWhite.rating,
    },
    black: {
      id: match.playerBlack.id,
      name: match.playerBlack.displayName,
      rating: match.playerBlack.rating,
    },
    fen: game.fen(),
    turn: game.turn(),
    moves: match.moves.map((move) => ({
      ply: move.ply,
      san: move.san,
      createdAt: move.createdAt.toISOString(),
    })),
    drawOffer: match.drawOfferedById
      ? {
          byId: match.drawOfferedById,
          byName:
            match.drawOfferedById === match.playerWhiteId
              ? match.playerWhite.displayName
              : match.playerBlack.displayName,
          at: match.drawOfferedAt?.toISOString() ?? new Date().toISOString(),
        }
      : null,
    takebackOffer: match.takebackOfferedById
      ? {
          byId: match.takebackOfferedById,
          byName:
            match.takebackOfferedById === match.playerWhiteId
              ? match.playerWhite.displayName
              : match.playerBlack.displayName,
          at:
            match.takebackOfferedAt?.toISOString() ??
            new Date().toISOString(),
        }
      : null,
  };
}
