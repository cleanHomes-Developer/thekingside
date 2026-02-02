import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payouts = await prisma.payout.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, tournament: true },
  });

  return NextResponse.json({
    payouts: payouts.map((payout) => ({
      id: payout.id,
      userId: payout.userId,
      userDisplayName: payout.user.displayName,
      tournamentId: payout.tournamentId,
      tournamentName: payout.tournament.name,
      amount: payout.amount.toString(),
      status: payout.status,
      antiCheatHold: payout.antiCheatHold,
      createdAt: payout.createdAt.toISOString(),
    })),
  });
}
