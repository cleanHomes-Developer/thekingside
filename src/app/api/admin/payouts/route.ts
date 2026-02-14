import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";

export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(Number(url.searchParams.get("page") ?? "1") || 1, 1);
  const limit = Math.min(
    Math.max(Number(url.searchParams.get("limit") ?? "25") || 25, 1),
    100,
  );
  const skip = (page - 1) * limit;
  const [payouts, total] = await prisma.$transaction([
    prisma.payout.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true, tournament: true },
      skip,
      take: limit,
    }),
    prisma.payout.count(),
  ]);

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
    page,
    total,
    pageSize: limit,
  });
}
