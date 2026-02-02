import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { getSeasonConfig } from "@/lib/season";
import { Prisma } from "@prisma/client";

type RouteContext = {
  params: { id: string };
};

const sponsorSchema = z.object({
  name: z.string().min(2).max(120),
  tier: z.enum(["PLATINUM", "GOLD", "SILVER", "BRONZE"]),
  logoUrl: z.string().url(),
  websiteUrl: z.string().url().optional().nullable(),
  tagline: z.string().max(180).optional().nullable(),
  active: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(100).default(0),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});

export async function PUT(request: NextRequest, { params }: RouteContext) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.sponsor.findUnique({
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

  const parsed = sponsorSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const shouldActivate = parsed.data.active && !existing.active;
  const season = shouldActivate ? await getSeasonConfig() : null;
  const SPONSOR_LIMIT_ERROR = "SPONSOR_LIMIT_REACHED";

  try {
    const sponsor = shouldActivate
      ? await prisma.$transaction(
          async (tx) => {
            if (season) {
              const activeCount = await tx.sponsor.count({
                where: { active: true },
              });
              if (activeCount >= season.sponsorSlots) {
                throw new Error(SPONSOR_LIMIT_ERROR);
              }
            }

            return tx.sponsor.update({
              where: { id: params.id },
              data: {
                name: parsed.data.name,
                tier: parsed.data.tier,
                logoUrl: parsed.data.logoUrl,
                websiteUrl: parsed.data.websiteUrl ?? undefined,
                tagline: parsed.data.tagline ?? undefined,
                active: parsed.data.active,
                sortOrder: parsed.data.sortOrder,
                startsAt: parsed.data.startsAt
                  ? new Date(parsed.data.startsAt)
                  : null,
                endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
              },
            });
          },
          { isolationLevel: "Serializable" },
        )
      : await prisma.sponsor.update({
          where: { id: params.id },
          data: {
            name: parsed.data.name,
            tier: parsed.data.tier,
            logoUrl: parsed.data.logoUrl,
            websiteUrl: parsed.data.websiteUrl ?? undefined,
            tagline: parsed.data.tagline ?? undefined,
            active: parsed.data.active,
            sortOrder: parsed.data.sortOrder,
            startsAt: parsed.data.startsAt
              ? new Date(parsed.data.startsAt)
              : null,
            endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
          },
        });

    return NextResponse.json({ sponsor });
  } catch (error) {
    if (error instanceof Error && error.message === SPONSOR_LIMIT_ERROR) {
      return NextResponse.json(
        {
          error: `Active sponsor limit reached (${season?.sponsorSlots ?? 0}).`,
        },
        { status: 400 },
      );
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2034"
    ) {
      return NextResponse.json(
        { error: "Sponsor slot conflict. Please retry." },
        { status: 409 },
      );
    }
    throw error;
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.sponsor.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.sponsor.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
