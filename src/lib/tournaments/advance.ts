import { prisma } from "@/lib/db";
import { EntryStatus, TournamentStatus } from "@prisma/client";
import { generateSwissRound, getSwissRounds } from "@/lib/tournaments/swiss";
import { assignLichessGames } from "@/lib/lichess/games";

export async function maybeAdvanceSwissRound(tournamentId: string) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });
  if (!tournament || tournament.status !== TournamentStatus.IN_PROGRESS) {
    return { advanced: false };
  }

  const entries = await prisma.entry.findMany({
    where: {
      tournamentId,
      status: EntryStatus.CONFIRMED,
    },
    orderBy: { createdAt: "asc" },
  });

  const totalRounds = getSwissRounds(entries.length);
  if (totalRounds === 0) {
    return { advanced: false };
  }

  const matches = await prisma.match.findMany({
    where: { tournamentId },
    orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
  });
  if (matches.length === 0) {
    return { advanced: false };
  }

  const currentRound = Math.max(...matches.map((match) => match.round));
  const currentRoundMatches = matches.filter(
    (match) => match.round === currentRound,
  );
  if (currentRoundMatches.some((match) => match.status !== "COMPLETED")) {
    return { advanced: false };
  }

  if (currentRound >= totalRounds) {
    await prisma.tournament.update({
      where: { id: tournamentId },
      data: { status: TournamentStatus.COMPLETED },
    });
    return { advanced: false, completed: true };
  }

  const nextRound = currentRound + 1;
  const existingNextRound = matches.some(
    (match) => match.round === nextRound,
  );
  if (existingNextRound) {
    return { advanced: false };
  }

  const nextPairings = generateSwissRound(
    entries.map((entry) => ({ userId: entry.userId })),
    matches.map((match) => ({
      player1Id: match.player1Id,
      player2Id: match.player2Id,
      result: match.result as "PLAYER1" | "PLAYER2" | "DRAW" | null,
    })),
    nextRound,
  );

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.match.createMany({
      data: nextPairings.map((match) => ({
        tournamentId,
        round: match.round,
        player1Id: match.player1Id,
        player2Id: match.player2Id,
        status: match.status,
        result: match.result,
        scheduledAt: now,
        completedAt: match.status === "COMPLETED" ? now : null,
      })),
    });
  });

  await assignLichessGames(tournamentId, nextRound);

  return { advanced: true };
}
