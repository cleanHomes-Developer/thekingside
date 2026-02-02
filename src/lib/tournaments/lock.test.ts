import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db";
import { enforceTournamentLock } from "./lock";
import { computeLockAt } from "./validation";
import { randomUUID } from "crypto";

async function createTestUser() {
  const id = randomUUID();
  return prisma.user.create({
    data: {
      id,
      email: `test-${id}@example.com`,
      passwordHash: "hash",
      name: "Test User",
      displayName: "test-user",
    },
  });
}

describe("tournament lock rules", () => {
  it("computes lockAt two minutes before start", () => {
    const start = new Date("2030-01-01T12:00:00.000Z");
    const lockAt = computeLockAt(start);
    expect(lockAt.toISOString()).toBe("2030-01-01T11:58:00.000Z");
  });

  it("cancels tournament when below minPlayers at lock", async () => {
    const user = await createTestUser();
    const now = new Date();
    const tournament = await prisma.tournament.create({
      data: {
        name: "Test Lock Cancel",
        type: "QUALIFIER",
        entryFee: 10,
        minPlayers: 4,
        maxPlayers: 8,
        startDate: now,
        lockAt: new Date(now.getTime() - 5 * 60 * 1000),
        createdBy: user.id,
      },
    });

    try {
      const updated = await enforceTournamentLock(tournament.id);
      expect(updated?.status).toBe("CANCELLED");
      expect(updated?.currentPlayers).toBe(0);
    } finally {
      await prisma.entry.deleteMany({ where: { tournamentId: tournament.id } });
      await prisma.tournament.delete({ where: { id: tournament.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  });

  it("starts tournament when checked-in players meet minPlayers", async () => {
    const user = await createTestUser();
    const now = new Date();
    const tournament = await prisma.tournament.create({
      data: {
        name: "Test Lock Pass",
        type: "QUALIFIER",
        entryFee: 10,
        minPlayers: 1,
        maxPlayers: 8,
        startDate: now,
        lockAt: new Date(now.getTime() - 5 * 60 * 1000),
        createdBy: user.id,
      },
    });

    try {
      await prisma.entry.create({
        data: {
          userId: user.id,
          tournamentId: tournament.id,
          status: "CONFIRMED",
          checkedInAt: new Date(),
        },
      });
      const updated = await enforceTournamentLock(tournament.id);
      expect(updated?.status).toBe("IN_PROGRESS");
      expect(updated?.currentPlayers).toBe(1);
    } finally {
      await prisma.entry.deleteMany({ where: { tournamentId: tournament.id } });
      await prisma.tournament.delete({ where: { id: tournament.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  });

  it("cancels tournament when no one checks in", async () => {
    const user = await createTestUser();
    const now = new Date();
    const tournament = await prisma.tournament.create({
      data: {
        name: "Test Lock No Checkin",
        type: "QUALIFIER",
        entryFee: 10,
        minPlayers: 1,
        maxPlayers: 8,
        startDate: now,
        lockAt: new Date(now.getTime() - 5 * 60 * 1000),
        createdBy: user.id,
      },
    });

    try {
      await prisma.entry.create({
        data: {
          userId: user.id,
          tournamentId: tournament.id,
          status: "CONFIRMED",
        },
      });
      const updated = await enforceTournamentLock(tournament.id);
      expect(updated?.status).toBe("CANCELLED");
    } finally {
      await prisma.entry.deleteMany({ where: { tournamentId: tournament.id } });
      await prisma.tournament.delete({ where: { id: tournament.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  });
});
