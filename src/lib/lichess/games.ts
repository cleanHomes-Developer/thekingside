import { prisma } from "@/lib/db";
import { createLichessChallenge, getLichessConfig } from "@/lib/lichess/client";

export async function assignLichessGames(
  tournamentId: string,
  round?: number,
) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
  });
  if (!tournament) {
    return { created: 0 };
  }

  const matches = await prisma.match.findMany({
    where: {
      tournamentId,
      lichessGameId: null,
      ...(round ? { round } : {}),
    },
  });

  const config = getLichessConfig();
  const platformToken = config?.platformToken ?? null;

  const updatedMatches = [];
  for (const match of matches) {
    if (!match.player2Id) {
      continue;
    }

    const [player1, player2] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: match.player1Id } }),
      prisma.profile.findUnique({ where: { userId: match.player2Id } }),
    ]);

    let gameId = `dev-${match.id}`;
    if (platformToken && player2?.lichessUsername) {
      const challenge = await createLichessChallenge(
        player2.lichessUsername,
        tournament.timeControl ?? null,
        platformToken,
      );
      gameId = challenge.challenge.id;
    }

    const updated = await prisma.match.update({
      where: { id: match.id },
      data: { lichessGameId: gameId },
    });
    updatedMatches.push(updated);
  }

  return { created: updatedMatches.length };
}
