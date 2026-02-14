import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const alerts = await prisma.auditLog.findMany({
    where: { action: "QUEUE_FAILURE" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    alerts: alerts.map((alert) => ({
      id: alert.id,
      createdAt: alert.createdAt.toISOString(),
      entityId: alert.entityId,
      afterState: alert.afterState,
    })),
  });
}
