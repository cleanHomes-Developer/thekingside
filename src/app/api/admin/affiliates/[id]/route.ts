import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";

type RouteContext = {
  params: { id: string };
};

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

export async function PUT(request: NextRequest, { params }: RouteContext) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.affiliateProgram.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const program = await prisma.affiliateProgram.update({
    where: { id: params.id },
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

  return NextResponse.json({ program });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.affiliateProgram.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.affiliateProgram.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
