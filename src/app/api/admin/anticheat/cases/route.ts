import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cases = await prisma.antiCheatCase.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      tournament: true,
    },
  });

  return NextResponse.json({
    cases: cases.map((caseItem) => ({
      id: caseItem.id,
      userId: caseItem.userId,
      userDisplayName: caseItem.user.displayName,
      tournamentId: caseItem.tournamentId,
      tournamentName: caseItem.tournament.name,
      status: caseItem.status,
      riskLevel: caseItem.riskLevel,
      createdAt: caseItem.createdAt.toISOString(),
      resolvedAt: caseItem.resolvedAt?.toISOString() ?? null,
    })),
  });
}
