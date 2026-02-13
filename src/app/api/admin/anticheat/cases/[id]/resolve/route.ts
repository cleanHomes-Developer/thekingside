import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { resolveSchema } from "@/lib/anticheat/validation";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";

type RouteContext = {
  params: { id: string };
};

export async function POST(request: NextRequest, { params }: RouteContext) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = resolveSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const requestMeta = getRequestMeta(request);
  const caseItem = await prisma.antiCheatCase.findUnique({
    where: { id: params.id },
  });
  if (!caseItem) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    const updated = await tx.antiCheatCase.update({
      where: { id: caseItem.id },
      data: {
        status: parsed.data.status,
        adminNotes: parsed.data.adminNotes ?? null,
        resolvedBy: admin.id,
        resolvedAt: new Date(),
      },
    });

    await logAuditEvent(tx, {
      action: "ANTICHEAT_RESOLVE",
      userId: admin.id,
      entityType: "AntiCheatCase",
      entityId: updated.id,
      beforeState: {
        status: caseItem.status,
        adminNotes: caseItem.adminNotes,
      },
      afterState: {
        status: updated.status,
        adminNotes: updated.adminNotes,
        resolvedBy: updated.resolvedBy,
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });
  });

  return NextResponse.json({ ok: true });
}
