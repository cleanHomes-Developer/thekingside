import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";

const programSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.enum(["HARDWARE", "PLATFORMS", "STREAMING", "MARKETPLACES", "GENERAL"]),
  commissionType: z.enum(["PERCENT", "FLAT", "VARIABLE"]),
  commissionRange: z.string().min(1).max(40),
  cookieDuration: z.string().min(1).max(40),
  notes: z.string().max(240).optional().nullable(),
  affiliateUrl: z.string().url(),
  enabled: z.coerce.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(100).default(0),
});

function serializeProgram(program: {
  id: string;
  name: string;
  category: string;
  commissionType: string;
  commissionRange: string;
  cookieDuration: string;
  notes: string | null;
  affiliateUrl: string;
  enabled: boolean;
  sortOrder: number;
}) {
  return {
    id: program.id,
    name: program.name,
    category: program.category,
    commissionType: program.commissionType,
    commissionRange: program.commissionRange,
    cookieDuration: program.cookieDuration,
    notes: program.notes,
    affiliateUrl: program.affiliateUrl,
    enabled: program.enabled,
    sortOrder: program.sortOrder,
  };
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const programs = await prisma.affiliateProgram.findMany({
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ programs });
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

  const parsed = programSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const requestMeta = getRequestMeta(request);
  const program = await prisma.$transaction(async (tx) => {
    const created = await tx.affiliateProgram.create({
      data: {
        name: parsed.data.name,
        category: parsed.data.category,
        commissionType: parsed.data.commissionType,
        commissionRange: parsed.data.commissionRange,
        cookieDuration: parsed.data.cookieDuration,
        notes: parsed.data.notes ?? undefined,
        affiliateUrl: parsed.data.affiliateUrl,
        enabled: parsed.data.enabled,
        sortOrder: parsed.data.sortOrder,
      },
    });

    await logAuditEvent(tx, {
      action: "AFFILIATE_CREATE",
      userId: admin.id,
      entityType: "AffiliateProgram",
      entityId: created.id,
      afterState: serializeProgram(created),
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    return created;
  });

  return NextResponse.json({ program }, { status: 201 });
}
