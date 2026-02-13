import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { getSeasonConfig } from "@/lib/season";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";
import { Prisma } from "@prisma/client";

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

function serializeSponsor(sponsor: {
  id: string;
  name: string;
  tier: string;
  logoUrl: string;
  websiteUrl: string | null;
  tagline: string | null;
  active: boolean;
  sortOrder: number;
  startsAt: Date | null;
  endsAt: Date | null;
}) {
  return {
    id: sponsor.id,
    name: sponsor.name,
    tier: sponsor.tier,
    logoUrl: sponsor.logoUrl,
    websiteUrl: sponsor.websiteUrl,
    tagline: sponsor.tagline,
    active: sponsor.active,
    sortOrder: sponsor.sortOrder,
    startsAt: sponsor.startsAt ? sponsor.startsAt.toISOString() : null,
    endsAt: sponsor.endsAt ? sponsor.endsAt.toISOString() : null,
  };
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sponsors = await prisma.sponsor.findMany({
    orderBy: [{ active: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ sponsors });
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

  const parsed = sponsorSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const season = parsed.data.active ? await getSeasonConfig() : null;
  const SPONSOR_LIMIT_ERROR = "SPONSOR_LIMIT_REACHED";
  const requestMeta = getRequestMeta(request);

  try {
    const sponsor = await prisma.$transaction(
      async (tx) => {
        if (parsed.data.active && season) {
          const activeCount = await tx.sponsor.count({
            where: { active: true },
          });
          if (activeCount >= season.sponsorSlots) {
            throw new Error(SPONSOR_LIMIT_ERROR);
          }
        }

        const created = await tx.sponsor.create({
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
              : undefined,
            endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : undefined,
          },
        });

        await logAuditEvent(tx, {
          action: "SPONSOR_CREATE",
          userId: admin.id,
          entityType: "Sponsor",
          entityId: created.id,
          beforeState: null,
          afterState: serializeSponsor(created),
          ipAddress: requestMeta.ipAddress,
          userAgent: requestMeta.userAgent,
        });

        return created;
      },
      { isolationLevel: "Serializable" },
    );

    return NextResponse.json({ sponsor }, { status: 201 });
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
