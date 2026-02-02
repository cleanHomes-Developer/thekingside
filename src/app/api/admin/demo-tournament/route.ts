import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { computeLockAt } from "@/lib/tournaments/validation";
import { generateSwissRound, getSwissRounds } from "@/lib/tournaments/swiss";
import { EntryStatus } from "@prisma/client";

function randomResult() {
  const roll = Math.random();
  if (roll < 0.45) {
    return "PLAYER1" as const;
  }
  if (roll < 0.9) {
    return "PLAYER2" as const;
  }
  return "DRAW" as const;
}

function buildDemoName(index: number) {
  return `Demo Player ${index.toString().padStart(2, "0")}`;
}

export async function POST(request: NextRequest) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const startDate = new Date(now.getTime() + 5 * 60 * 1000);
  const lockAt = computeLockAt(startDate);
  const playerCount = 16;

  const tournament = await prisma.$transaction(async (tx) => {
    const created = await tx.tournament.create({
      data: {
        name: `Demo Swiss ${now.toISOString().slice(0, 10)}`,
        type: "QUALIFIER",
        status: "IN_PROGRESS",
        entryFee: 0,
        minPlayers: playerCount,
        maxPlayers: playerCount,
        currentPlayers: playerCount,
        prizePool: 0,
        startDate,
        lockAt,
        timeControl: "5+5",
        description: "Auto-simulated Swiss tournament.",
        createdBy: admin.id,
      },
    });

    const users = await Promise.all(
      Array.from({ length: playerCount }, (_, index) => {
        const stamp = `${Date.now()}-${index}`;
        return tx.user.create({
          data: {
            email: `demo-${stamp}@example.com`,
            passwordHash: "demo",
            name: buildDemoName(index + 1),
            displayName: buildDemoName(index + 1),
          },
        });
      }),
    );

    await Promise.all(
      users.map((user, index) =>
        tx.profile.create({
          data: {
            userId: user.id,
            country: "US",
            bio: "Demo participant.",
            lichessUsername: `demo${index + 1}`,
          },
        }),
      ),
    );

    await tx.entry.createMany({
      data: users.map((user) => ({
        userId: user.id,
        tournamentId: created.id,
        status: EntryStatus.CONFIRMED,
        checkedInAt: now,
        paidAt: now,
        paymentIntentId: `demo-${created.id}-${user.id}`,
      })),
    });

    return { created, users };
  });

  const entries = tournament.users.map((user) => ({ userId: user.id }));
  const rounds = getSwissRounds(entries.length);
  const matchesSoFar: {
    player1Id: string;
    player2Id: string | null;
    result: "PLAYER1" | "PLAYER2" | "DRAW" | null;
    round: number;
  }[] = [];

  for (let round = 1; round <= rounds; round += 1) {
    const pairings = generateSwissRound(entries, matchesSoFar, round);
    const roundMatches = pairings.map((pairing) => ({
      tournamentId: tournament.created.id,
      round: pairing.round,
      player1Id: pairing.player1Id,
      player2Id: pairing.player2Id,
      status: "COMPLETED",
      result:
        pairing.player2Id === null ? "PLAYER1" : randomResult(),
      scheduledAt: now,
      completedAt: now,
    }));

    await prisma.match.createMany({ data: roundMatches });

    matchesSoFar.push(
      ...roundMatches.map((match) => ({
        player1Id: match.player1Id,
        player2Id: match.player2Id ?? null,
        result: match.result as "PLAYER1" | "PLAYER2" | "DRAW",
        round: match.round,
      })),
    );
  }

  await prisma.tournament.update({
    where: { id: tournament.created.id },
    data: { status: "COMPLETED" },
  });

  return NextResponse.json({
    tournamentId: tournament.created.id,
  });
}
