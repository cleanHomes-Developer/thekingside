import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { generateSwissRound } from "@/lib/tournaments/swiss";
import { enforceTournamentLock } from "@/lib/tournaments/lock";
import { assignLichessGames } from "@/lib/lichess/games";

type RouteContext = {
  params: { id: string };
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tournament = await enforceTournamentLock(params.id);
  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();
  if (tournament.lockAt > now) {
    return NextResponse.json(
      { error: "Tournament is not locked yet" },
      { status: 400 },
    );
  }
  if (tournament.status !== "REGISTRATION") {
    return NextResponse.json(
      { error: "Bracket already generated or tournament closed" },
      { status: 400 },
    );
  }

  const entries = await prisma.entry.findMany({
    where: {
      tournamentId: tournament.id,
      status: "CONFIRMED",
    },
    orderBy: { createdAt: "asc" },
  });

  if (entries.length < tournament.minPlayers) {
    return NextResponse.json(
      { error: "Not enough players to generate bracket" },
      { status: 400 },
    );
  }

  const bracket = generateSwissRound(
    entries.map((entry) => ({ userId: entry.userId })),
    [],
    1,
  );

  await prisma.$transaction(async (tx) => {
    await tx.match.deleteMany({ where: { tournamentId: tournament.id } });
    await tx.match.createMany({
      data: bracket.map((match) => ({
        tournamentId: tournament.id,
        round: match.round,
        player1Id: match.player1Id,
        player2Id: match.player2Id,
        status: match.status,
        result: match.result,
        scheduledAt: tournament.startDate,
        completedAt: match.status === "COMPLETED" ? new Date() : null,
      })),
    });
    await tx.tournament.update({
      where: { id: tournament.id },
      data: {
        status: "IN_PROGRESS",
        currentPlayers: entries.length,
      },
    });
  });

  await assignLichessGames(tournament.id, 1);

  return NextResponse.json({ ok: true });
}
