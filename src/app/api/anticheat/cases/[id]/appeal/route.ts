import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { appealSchema } from "@/lib/anticheat/validation";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";

type RouteContext = {
  params: { id: string };
};

export async function POST(request: NextRequest, { params }: RouteContext) {
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

  const parsed = appealSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const caseItem = await prisma.antiCheatCase.findUnique({
    where: { id: params.id },
  });
  if (!caseItem || caseItem.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (caseItem.status === "RESOLVED" || caseItem.status === "DISMISSED") {
    return NextResponse.json(
      { error: "Case is closed" },
      { status: 400 },
    );
  }

  const requestMeta = getRequestMeta(request);
  await prisma.$transaction(async (tx) => {
    const updated = await tx.antiCheatCase.update({
      where: { id: caseItem.id },
      data: {
        appealText: parsed.data.appealText,
        status: "APPEALED",
      },
    });

    await logAuditEvent(tx, {
      action: "ANTICHEAT_APPEAL",
      userId: user.id,
      entityType: "AntiCheatCase",
      entityId: updated.id,
      beforeState: {
        status: caseItem.status,
      },
      afterState: {
        status: updated.status,
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });
  });

  return NextResponse.json({ ok: true });
}
