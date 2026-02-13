import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { canRequestPayout, hasAntiCheatHold } from "@/lib/payments/payouts";
import { getSeasonConfig } from "@/lib/season";
import { getPayoutEntitlement } from "@/lib/payments/entitlements";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";

export async function POST(request: NextRequest) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { tournamentId } = payload as {
    tournamentId?: string;
  };

  if (!tournamentId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [profile, tournament, entry, cases, season] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.tournament.findUnique({ where: { id: tournamentId } }),
    prisma.entry.findUnique({
      where: {
        userId_tournamentId: {
          userId: user.id,
          tournamentId,
        },
      },
    }),
    prisma.antiCheatCase.findMany({
      where: { userId: user.id, tournamentId },
    }),
    getSeasonConfig(),
  ]);

  if (!profile || !tournament || !entry) {
    return NextResponse.json({ error: "Not eligible" }, { status: 400 });
  }

  if (season.prizeMode !== "cash") {
    return NextResponse.json(
      { error: "Cash payouts are disabled. Gift cards are issued separately." },
      { status: 400 },
    );
  }

  if (tournament.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Tournament is not completed" },
      { status: 400 },
    );
  }

  const hold = hasAntiCheatHold(cases);
  if (!canRequestPayout(profile.kycStatus, hold)) {
    return NextResponse.json(
      { error: "Payout not allowed" },
      { status: 400 },
    );
  }

  const existingPayout = await prisma.payout.findUnique({
    where: {
      userId_tournamentId: {
        userId: user.id,
        tournamentId,
      },
    },
  });
  if (existingPayout) {
    return NextResponse.json(
      { payoutId: existingPayout.id, status: existingPayout.status },
      { status: 200 },
    );
  }

  const entitlement = await getPayoutEntitlement(prisma, tournamentId, user.id);
  if (!entitlement) {
    return NextResponse.json({ error: "No payout entitlement" }, { status: 400 });
  }

  const requestMeta = getRequestMeta(request);
  const payout = await prisma.$transaction(async (tx) => {
    const created = await tx.payout.create({
      data: {
        userId: user.id,
        tournamentId,
        amount: entitlement.amount,
        entitlementAmount: entitlement.amount,
        placement: entitlement.placement,
        status: "PENDING",
        antiCheatHold: hold,
        kycVerifiedAt: profile.kycVerifiedAt ?? null,
      },
    });

    await logAuditEvent(tx, {
      action: "PAYOUT_REQUESTED",
      userId: user.id,
      entityType: "Payout",
      entityId: created.id,
      beforeState: null,
      afterState: {
        amount: entitlement.amount.toString(),
        placement: entitlement.placement,
        percent: entitlement.percent.toString(),
        tournamentId,
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    return created;
  });

  return NextResponse.json({ payoutId: payout.id }, { status: 201 });
}
