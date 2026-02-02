import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";

type RouteContext = {
  params: { tournamentId: string };
};

export async function GET(_: Request, { params }: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: params.tournamentId },
  });
  if (!tournament) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ledger = await prisma.prizePoolLedger.findMany({
    where: { tournamentId: params.tournamentId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    tournament: {
      id: tournament.id,
      name: tournament.name,
    },
    ledger: ledger.map((entry) => ({
      id: entry.id,
      type: entry.type,
      amount: entry.amount.toString(),
      description: entry.description,
      relatedUserId: entry.relatedUserId,
      balance: entry.balance.toString(),
      createdAt: entry.createdAt.toISOString(),
    })),
  });
}
