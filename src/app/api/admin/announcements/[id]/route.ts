import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";

type RouteContext = {
  params: { id: string };
};

const announcementSchema = z.object({
  title: z.string().min(2).max(120),
  subject: z.string().min(2).max(140),
  body: z.string().min(2).max(5000),
  audience: z.enum(["ALL", "RANDOM", "SELECTED"]).default("ALL"),
  randomCount: z.coerce.number().int().min(1).max(10000).optional(),
  userIds: z.array(z.string().uuid()).optional(),
});

function buildFilters(input: z.infer<typeof announcementSchema>) {
  if (input.audience === "RANDOM") {
    return { randomCount: input.randomCount ?? 1 };
  }
  if (input.audience === "SELECTED") {
    return { userIds: input.userIds ?? [] };
  }
  return null;
}

export async function GET(_: NextRequest, { params }: RouteContext) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const announcement = await prisma.adminAnnouncement.findUnique({
    where: { id: params.id },
    include: { deliveries: { orderBy: { createdAt: "desc" }, take: 200 } },
  });
  if (!announcement) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ announcement });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.adminAnnouncement.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.status === "SENT") {
    return NextResponse.json(
      { error: "Sent announcements cannot be edited." },
      { status: 400 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = announcementSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const filters = buildFilters(parsed.data);
  const requestMeta = getRequestMeta(request);
  const updated = await prisma.$transaction(async (tx) => {
    const announcement = await tx.adminAnnouncement.update({
      where: { id: params.id },
      data: {
        title: parsed.data.title,
        subject: parsed.data.subject,
        body: parsed.data.body,
        audience: parsed.data.audience,
        audienceFilters: filters ?? undefined,
      },
    });

    await logAuditEvent(tx, {
      action: "ANNOUNCEMENT_UPDATE",
      userId: admin.id,
      entityType: "AdminAnnouncement",
      entityId: announcement.id,
      beforeState: {
        title: existing.title,
        subject: existing.subject,
        audience: existing.audience,
        status: existing.status,
      },
      afterState: {
        title: announcement.title,
        subject: announcement.subject,
        audience: announcement.audience,
        status: announcement.status,
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    return announcement;
  });

  return NextResponse.json({ announcement: updated });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.adminAnnouncement.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const requestMeta = getRequestMeta(request);
  await prisma.$transaction(async (tx) => {
    await tx.adminAnnouncement.delete({ where: { id: params.id } });
    await logAuditEvent(tx, {
      action: "ANNOUNCEMENT_DELETE",
      userId: admin.id,
      entityType: "AdminAnnouncement",
      entityId: existing.id,
      beforeState: {
        title: existing.title,
        subject: existing.subject,
        audience: existing.audience,
        status: existing.status,
      },
      afterState: null,
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });
  });

  return NextResponse.json({ ok: true });
}
