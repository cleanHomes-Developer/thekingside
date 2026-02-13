import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { reportSchema } from "@/lib/anticheat/validation";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";

export async function POST(request: NextRequest) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = reportSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const evidence = {
    ...parsed.data.evidence,
    description: parsed.data.description ?? null,
    reportedBy: user.id,
  };

  const requestMeta = getRequestMeta(request);
  const caseItem = await prisma.$transaction(async (tx) => {
    const created = await tx.antiCheatCase.create({
      data: {
        userId: user.id,
        tournamentId: parsed.data.tournamentId,
        matchId: parsed.data.matchId ?? undefined,
        riskLevel: parsed.data.riskLevel ?? "LOW",
        status: "SOFT_FLAG",
        evidence: JSON.stringify(evidence),
      },
    });

    await logAuditEvent(tx, {
      action: "ANTICHEAT_REPORT",
      userId: user.id,
      entityType: "AntiCheatCase",
      entityId: created.id,
      afterState: {
        tournamentId: created.tournamentId,
        matchId: created.matchId,
        riskLevel: created.riskLevel,
        status: created.status,
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    return created;
  });

  return NextResponse.json({ caseId: caseItem.id }, { status: 201 });
}
