import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
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

  const payout = await prisma.payout.findUnique({
    where: { id: params.id },
  });
  if (!payout) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (payout.status !== "PENDING") {
    return NextResponse.json({ error: "Payout not pending" }, { status: 400 });
  }

  const requestMeta = getRequestMeta(request);
  await prisma.$transaction(async (tx) => {
    await tx.payout.update({
      where: { id: payout.id },
      data: {
        status: "REJECTED",
        processedAt: new Date(),
      },
    });

    await logAuditEvent(tx, {
      action: "PAYOUT_REJECTED",
      userId: admin.id,
      entityType: "Payout",
      entityId: payout.id,
      beforeState: { status: "PENDING" },
      afterState: { status: "REJECTED" },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });
  });

  return NextResponse.json({ ok: true });
}
