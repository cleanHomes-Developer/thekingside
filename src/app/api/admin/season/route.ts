import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { getSeasonConfig, setSeasonConfig } from "@/lib/season";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";
import { prisma } from "@/lib/db";

function serializeSeasonConfig(config: Awaited<ReturnType<typeof getSeasonConfig>>) {
  if (!config) {
    return null;
  }
  return {
    mode: config.mode,
    freePrizePool: config.freePrizePool?.toString?.() ?? config.freePrizePool,
    prizeMode: config.prizeMode,
    sponsorshipEnabled: config.sponsorshipEnabled,
    sponsorSlots: config.sponsorSlots,
  };
}

const updateSchema = z.object({
  mode: z.enum(["free", "paid"]),
  freePrizePool: z.coerce.number().min(0).max(100000),
  prizeMode: z.enum(["gift_card", "cash"]),
  sponsorshipEnabled: z.coerce.boolean(),
  sponsorSlots: z.coerce.number().int().min(1).max(5),
});

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getSeasonConfig();
  return NextResponse.json({ config });
}

export async function PUT(request: NextRequest) {
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

  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const requestMeta = getRequestMeta(request);
  const before = await getSeasonConfig();
  const config = await setSeasonConfig(parsed.data);

  await logAuditEvent(prisma, {
    action: "SEASON_CONFIG_UPDATE",
    userId: admin.id,
    entityType: "SeasonConfig",
    entityId: "1",
    beforeState: serializeSeasonConfig(before),
    afterState: serializeSeasonConfig(config),
    ipAddress: requestMeta.ipAddress,
    userAgent: requestMeta.userAgent,
  });
  return NextResponse.json({ config });
}
