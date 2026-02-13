import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { getQueue } from "@/lib/queues";
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

  const announcement = await prisma.adminAnnouncement.findUnique({
    where: { id: params.id },
  });
  if (!announcement) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (announcement.status === "SENT") {
    return NextResponse.json({ error: "Already sent" }, { status: 400 });
  }

  const requestMeta = getRequestMeta(request);
  const scheduledAt =
    announcement.scheduledAt && announcement.scheduledAt > new Date()
      ? announcement.scheduledAt
      : new Date();

  await prisma.adminAnnouncement.update({
    where: { id: announcement.id },
    data: {
      status: "SCHEDULED",
      scheduledAt,
    },
  });

  await logAuditEvent(prisma, {
    action: "ANNOUNCEMENT_SEND",
    userId: admin.id,
    entityType: "AdminAnnouncement",
    entityId: announcement.id,
    afterState: { status: "SCHEDULED" },
    ipAddress: requestMeta.ipAddress,
    userAgent: requestMeta.userAgent,
  });

  try {
    const queue = getQueue("announcements");
    const delayMs = Math.max(0, scheduledAt.getTime() - Date.now());
    await queue.add(
      "announcement",
      { announcementId: announcement.id },
      { delay: delayMs, removeOnComplete: true, removeOnFail: false },
    );
  } catch {
    return NextResponse.json(
      { error: "Queue is unavailable. Configure REDIS_URL." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
