import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await prisma.entry.findMany({
    where: {
      userId: user.id,
      paymentIntentId: { not: null },
    },
    include: {
      tournament: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    payments: entries.map((entry) => ({
      entryId: entry.id,
      tournamentId: entry.tournamentId,
      tournamentName: entry.tournament.name,
      status: entry.status,
      amount: entry.tournament.entryFee.toString(),
      paidAt: entry.paidAt?.toISOString() ?? null,
      paymentIntentId: entry.paymentIntentId,
    })),
  });
}
