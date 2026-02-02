import { prisma } from "@/lib/db";
import { EntryStatus, TournamentStatus } from "@prisma/client";
import { generateSwissRound } from "@/lib/tournaments/swiss";
import { assignLichessGames } from "@/lib/lichess/games";

export async function enforceTournamentLock(tournamentId: string) {
  const now = new Date();
  let shouldAssignGames = false;
  let finalPlayers = 0;

  const updated = await prisma.$transaction(async (tx) => {
    const tournament = await tx.tournament.findUnique({
      where: { id: tournamentId },
      select: {
        id: true,
        status: true,
        lockAt: true,
        minPlayers: true,
        maxPlayers: true,
        startDate: true,
      },
    });

    if (!tournament) {
      return null;
    }

    const entries = await tx.entry.findMany({
      where: {
        tournamentId,
        status: { not: EntryStatus.CANCELLED },
      },
      orderBy: [{ checkedInAt: "asc" }, { createdAt: "asc" }],
    });
    const seatsReserved = entries.filter((entry) =>
      [EntryStatus.CONFIRMED, EntryStatus.PENDING].includes(entry.status),
    );
    const entriesCount = seatsReserved.length;

    let nextStatus = tournament.status;
    if (
      tournament.status === TournamentStatus.REGISTRATION &&
      tournament.lockAt <= now
    ) {
      const checkedIn = entries.filter((entry) => entry.checkedInAt);
      const confirmedCheckedIn = checkedIn.filter(
        (entry) => entry.status === EntryStatus.CONFIRMED,
      );
      const waitlistCheckedIn = checkedIn.filter(
        (entry) => entry.status === EntryStatus.WAITLIST,
      );
      const ordered = [...confirmedCheckedIn, ...waitlistCheckedIn];
      const selected = ordered.slice(0, tournament.maxPlayers);

      if (selected.length < tournament.minPlayers) {
        nextStatus = TournamentStatus.CANCELLED;
        await tx.entry.updateMany({
          where: { tournamentId },
          data: { status: EntryStatus.CANCELLED },
        });
      } else {
        finalPlayers = selected.length;
        const selectedIds = new Set(selected.map((entry) => entry.id));
        const promoteIds = selected
          .filter((entry) => entry.status === EntryStatus.WAITLIST)
          .map((entry) => entry.id);
        const cancelIds = entries
          .filter((entry) => !selectedIds.has(entry.id))
          .map((entry) => entry.id);

        if (promoteIds.length) {
          await tx.entry.updateMany({
            where: { id: { in: promoteIds } },
            data: { status: EntryStatus.CONFIRMED },
          });
        }
        if (cancelIds.length) {
          await tx.entry.updateMany({
            where: { id: { in: cancelIds } },
            data: { status: EntryStatus.CANCELLED },
          });
        }

        const round1 = generateSwissRound(
          selected.map((entry) => ({ userId: entry.userId })),
          [],
          1,
        );

        await tx.match.deleteMany({ where: { tournamentId } });
        await tx.match.createMany({
          data: round1.map((match) => ({
            tournamentId,
            round: match.round,
            player1Id: match.player1Id,
            player2Id: match.player2Id,
            status: match.status,
            result: match.result,
            scheduledAt: tournament.startDate,
            completedAt: match.status === "COMPLETED" ? now : null,
          })),
        });

        nextStatus = TournamentStatus.IN_PROGRESS;
        shouldAssignGames = true;
      }
    }

    return tx.tournament.update({
      where: { id: tournamentId },
      data: {
        status: nextStatus,
        currentPlayers:
          nextStatus === TournamentStatus.IN_PROGRESS
            ? finalPlayers
            : entriesCount,
      },
    });
  });

  if (shouldAssignGames) {
    await assignLichessGames(tournamentId, 1);
  }

  return updated;
}

export async function enforceTournamentLocks() {
  const now = new Date();
  const candidates = await prisma.tournament.findMany({
    where: {
      status: TournamentStatus.REGISTRATION,
      lockAt: { lte: now },
    },
    select: {
      id: true,
    },
  });

  for (const candidate of candidates) {
    await enforceTournamentLock(candidate.id);
  }
}
