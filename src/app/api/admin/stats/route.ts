import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [usersCount, entriesCount, payoutsPending, tournamentsCompleted] =
    await Promise.all([
      prisma.user.count(),
      prisma.entry.count(),
      prisma.payout.count({ where: { status: "PENDING" } }),
      prisma.tournament.count({ where: { status: "COMPLETED" } }),
    ]);

  const uniquePlayers = await prisma.entry.findMany({
    distinct: ["userId"],
    select: { userId: true },
  });

  const totalPrizePool = await prisma.tournament.aggregate({
    _sum: { prizePool: true },
  });

  const totalLedger = await prisma.prizePoolLedger.aggregate({
    _sum: { amount: true },
  });

  const adminProfit = await prisma.prizePoolLedger.aggregate({
    _sum: { amount: true },
    where: { type: "PLATFORM_FEE" },
  });

  return NextResponse.json({
    usersCount,
    entriesCount,
    uniquePlayers: uniquePlayers.length,
    tournamentsCompleted,
    payoutsPending,
    totalPrizePool: totalPrizePool._sum.prizePool ?? 0,
    totalLedger: totalLedger._sum.amount ?? 0,
    adminProfit: adminProfit._sum.amount ?? 0,
  });
}
