import type { Tournament } from "@prisma/client";

export function serializeTournament(tournament: Tournament) {
  return {
    id: tournament.id,
    name: tournament.name,
    type: tournament.type,
    status: tournament.status,
    entryFee: tournament.entryFee.toString(),
    minPlayers: tournament.minPlayers,
    maxPlayers: tournament.maxPlayers,
    currentPlayers: tournament.currentPlayers,
    prizePool: tournament.prizePool.toString(),
    startDate: tournament.startDate.toISOString(),
    endDate: tournament.endDate ? tournament.endDate.toISOString() : null,
    lockAt: tournament.lockAt.toISOString(),
    timeControl: tournament.timeControl,
    seriesKey: tournament.seriesKey,
    slotKey: tournament.slotKey,
    description: tournament.description,
    createdBy: tournament.createdBy,
    createdAt: tournament.createdAt.toISOString(),
    updatedAt: tournament.updatedAt.toISOString(),
  };
}
