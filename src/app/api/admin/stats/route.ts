import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";

const getCachedStats = unstable_cache(
  async () => {
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

    const [platformFees, stripeFees] = await Promise.all([
      prisma.prizePoolLedger.aggregate({
        _sum: { amount: true },
        where: { type: "PLATFORM_FEE" },
      }),
      prisma.prizePoolLedger.aggregate({
        _sum: { amount: true },
        where: { type: "STRIPE_FEE" },
      }),
    ]);

    const platformFeeSum = platformFees._sum.amount
      ? Number(platformFees._sum.amount)
      : 0;
    const stripeFeeSum = stripeFees._sum.amount
      ? Number(stripeFees._sum.amount)
      : 0;
    const adminProfit = platformFeeSum + stripeFeeSum;

    return {
      usersCount,
      entriesCount,
      uniquePlayers: uniquePlayers.length,
      tournamentsCompleted,
      payoutsPending,
      totalPrizePool: totalPrizePool._sum.prizePool ?? 0,
      totalLedger: totalLedger._sum.amount ?? 0,
      adminProfit,
    };
  },
  ["admin-stats"],
  { revalidate: 30 },
);

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stats = await getCachedStats();
  return NextResponse.json(stats);
}
