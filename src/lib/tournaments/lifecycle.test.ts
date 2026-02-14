import { describe, expect, it } from "vitest";
import { computeLockAt } from "./validation";
import { generateSwissRound, getSwissRounds } from "./swiss";

function buildEntries(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    userId: `player-${index + 1}`,
  }));
}

describe("tournament lifecycle", () => {
  it("computes lock and check-in windows", () => {
    const start = new Date("2026-02-01T12:00:00.000Z");
    const lockAt = computeLockAt(start);
    const checkInOpens = new Date(start);
    checkInOpens.setMinutes(checkInOpens.getMinutes() - 20);
    expect(lockAt.toISOString()).toBe("2026-02-01T11:58:00.000Z");
    expect(checkInOpens.toISOString()).toBe("2026-02-01T11:40:00.000Z");
  });

  it("computes Swiss rounds by player count", () => {
    expect(getSwissRounds(16)).toBe(5);
    expect(getSwissRounds(7)).toBe(4);
  });

  it("creates a bye when player count is odd", () => {
    const entries = buildEntries(5);
    const pairings = generateSwissRound(entries, [], 1);
    const bye = pairings.find((match) => match.player2Id === null);
    expect(bye).toBeTruthy();
    expect(pairings.length).toBe(3);
  });
});
