import type { Tournament, Entry } from "@prisma/client";

export function canRefundEntry(entry: Entry, tournament: Tournament, now: Date) {
  if (entry.status === "CANCELLED") {
    return false;
  }
  if (tournament.status !== "REGISTRATION") {
    return false;
  }
  return tournament.lockAt > now;
}
