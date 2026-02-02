import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payouts = await prisma.payout.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    payouts: payouts.map((payout) => ({
      id: payout.id,
      tournamentId: payout.tournamentId,
      amount: payout.amount.toString(),
      status: payout.status,
      createdAt: payout.createdAt.toISOString(),
      processedAt: payout.processedAt?.toISOString() ?? null,
    })),
  });
}
