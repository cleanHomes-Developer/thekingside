import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildStandings } from "@/lib/tournaments/standings";
import { enforceTournamentLock } from "@/lib/tournaments/lock";

type RouteContext = {
  params: { id: string };
};

export async function GET(_: Request, { params }: RouteContext) {
  await enforceTournamentLock(params.id);

  const [entries, matches] = await Promise.all([
    prisma.entry.findMany({
      where: { tournamentId: params.id, status: "CONFIRMED" },
      include: { user: true },
    }),
    prisma.match.findMany({
      where: { tournamentId: params.id },
    }),
  ]);

  const standings = buildStandings(
    entries.map((entry) => ({ userId: entry.userId })),
    matches.map((match) => ({
      player1Id: match.player1Id,
      player2Id: match.player2Id,
      result: match.result as "PLAYER1" | "PLAYER2" | "DRAW" | null,
    })),
  ).map((standing) => {
    const entry = entries.find((item) => item.userId === standing.userId);
    return {
      ...standing,
      displayName: entry?.user.displayName ?? "Unknown",
    };
  });

  return NextResponse.json({ standings });
}
