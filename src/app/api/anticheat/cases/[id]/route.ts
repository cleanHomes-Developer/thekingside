import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, requireAdmin } from "@/lib/auth/guards";

type RouteContext = {
  params: { id: string };
};

export async function GET(_: Request, { params }: RouteContext) {
  const user = await requireUser();
  const admin = user ? await requireAdmin() : null;

  if (!user && !admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const caseItem = await prisma.antiCheatCase.findUnique({
    where: { id: params.id },
  });

  if (!caseItem) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!admin && caseItem.userId !== user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    case: {
      id: caseItem.id,
      userId: caseItem.userId,
      tournamentId: caseItem.tournamentId,
      matchId: caseItem.matchId,
      status: caseItem.status,
      riskLevel: caseItem.riskLevel,
      evidence: caseItem.evidence,
      appealText: caseItem.appealText,
      adminNotes: admin ? caseItem.adminNotes : null,
      createdAt: caseItem.createdAt.toISOString(),
      resolvedAt: caseItem.resolvedAt?.toISOString() ?? null,
    },
  });
}
