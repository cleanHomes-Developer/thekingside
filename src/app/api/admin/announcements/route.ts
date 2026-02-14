import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";

const announcementSchema = z.object({
  title: z.string().min(2).max(120),
  subject: z.string().min(2).max(140),
  body: z.string().min(2).max(5000),
  audience: z.enum(["ALL", "RANDOM", "SELECTED"]).default("ALL"),
  randomCount: z.coerce.number().int().min(1).max(10000).optional(),
  userIds: z.array(z.string().uuid()).optional(),
  scheduledAt: z.string().optional(),
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

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const page = Math.max(Number(request.nextUrl.searchParams.get("page") ?? "1") || 1, 1);
  const limit = Math.min(
    Math.max(Number(request.nextUrl.searchParams.get("limit") ?? "20") || 20, 1),
    100,
  );
  const skip = (page - 1) * limit;
  const [announcements, total] = await prisma.$transaction([
    prisma.adminAnnouncement.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.adminAnnouncement.count(),
  ]);

  return NextResponse.json({ announcements, page, total, pageSize: limit });
}

export async function POST(request: NextRequest) {
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

  const parsed = announcementSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const requestMeta = getRequestMeta(request);
  const filters = buildFilters(parsed.data);
  const announcement = await prisma.$transaction(async (tx) => {
    const created = await tx.adminAnnouncement.create({
      data: {
        title: parsed.data.title,
        subject: parsed.data.subject,
        body: parsed.data.body,
        audience: parsed.data.audience,
        audienceFilters: filters ?? undefined,
        scheduledAt: parsed.data.scheduledAt
          ? new Date(parsed.data.scheduledAt)
          : null,
        createdBy: admin.id,
      },
    });

    await logAuditEvent(tx, {
      action: "ANNOUNCEMENT_CREATE",
      userId: admin.id,
      entityType: "AdminAnnouncement",
      entityId: created.id,
      afterState: {
        title: created.title,
        subject: created.subject,
        audience: created.audience,
        status: created.status,
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    return created;
  });

  return NextResponse.json({ announcement }, { status: 201 });
}
