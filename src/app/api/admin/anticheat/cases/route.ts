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
  const [cases, total] = await prisma.$transaction([
    prisma.antiCheatCase.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        tournament: true,
      },
      skip,
      take: limit,
    }),
    prisma.antiCheatCase.count(),
  ]);

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
    page,
    total,
    pageSize: limit,
  });
}
