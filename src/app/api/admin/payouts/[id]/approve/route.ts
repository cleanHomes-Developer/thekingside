import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { getStripeClient } from "@/lib/payments/stripe";
import { createLedgerEntries } from "@/lib/payments/ledger";
import { getSeasonConfig } from "@/lib/season";
import { getPayoutEntitlement } from "@/lib/payments/entitlements";
import { canRequestPayout, hasAntiCheatHold } from "@/lib/payments/payouts";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";
import { Prisma } from "@prisma/client";

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

  const payout = await prisma.payout.findUnique({
    where: { id: params.id },
    include: {
      tournament: true,
      user: { include: { profile: true } },
    },
  });
  if (!payout) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (payout.status !== "PENDING") {
    return NextResponse.json({ error: "Payout not pending" }, { status: 400 });
  }

  const season = await getSeasonConfig();
  if (season.prizeMode !== "cash") {
    return NextResponse.json(
      { error: "Cash payouts are disabled for gift card mode" },
      { status: 400 },
    );
  }

  const profile = payout.user.profile;
  if (!profile?.stripeConnectAccountId) {
    return NextResponse.json(
      { error: "User not connected to Stripe" },
      { status: 400 },
    );
  }

  const cases = await prisma.antiCheatCase.findMany({
    where: { userId: payout.userId, tournamentId: payout.tournamentId },
  });
  const hold = hasAntiCheatHold(cases);
  if (!canRequestPayout(profile.kycStatus, hold)) {
    return NextResponse.json({ error: "Payout not allowed" }, { status: 400 });
  }

  const entitlement =
    payout.entitlementAmount && payout.placement
      ? {
          amount: new Prisma.Decimal(payout.entitlementAmount),
          placement: payout.placement,
        }
      : await getPayoutEntitlement(prisma, payout.tournamentId, payout.userId);

  if (!entitlement) {
    return NextResponse.json(
      { error: "Payout entitlement missing" },
      { status: 400 },
    );
  }

  if (!payout.entitlementAmount || !payout.placement) {
    await prisma.payout.update({
      where: { id: payout.id },
      data: {
        entitlementAmount: entitlement.amount,
        placement: entitlement.placement,
      },
    });
  }

  if (entitlement.amount.toString() !== payout.amount.toString()) {
    return NextResponse.json(
      { error: "Payout amount does not match entitlement" },
      { status: 400 },
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const requestMeta = getRequestMeta(request);
  const updated = await prisma.payout.updateMany({
    where: { id: payout.id, status: "PENDING" },
    data: { status: "PROCESSING" },
  });
  if (updated.count === 0) {
    return NextResponse.json({ error: "Payout already processed" }, { status: 409 });
  }

  let transfer;
  try {
    transfer = await stripe.transfers.create(
      {
        amount: Math.round(Number(payout.amount) * 100),
        currency: "usd",
        destination: profile.stripeConnectAccountId,
      },
      { idempotencyKey: payout.id },
    );
  } catch (error) {
    await prisma.payout.update({
      where: { id: payout.id },
      data: { status: "FAILED", processedAt: new Date() },
    });
    return NextResponse.json({ error: "Stripe transfer failed" }, { status: 502 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.payout.update({
      where: { id: payout.id },
      data: {
        status: "COMPLETED",
        stripePayoutId: transfer.id,
        processedAt: new Date(),
      },
    });

    await tx.tournament.update({
      where: { id: payout.tournamentId },
      data: {
        prizePool: { decrement: new Prisma.Decimal(payout.amount) },
      },
    });

    await createLedgerEntries(tx, payout.tournamentId, [
      {
        type: "PAYOUT",
        amount: new Prisma.Decimal(payout.amount).mul(-1),
        description: `Payout ${payout.id} approved`,
        relatedUserId: payout.userId,
        relatedPayoutId: payout.id,
        affectsBalance: true,
      },
    ]);

    await logAuditEvent(tx, {
      action: "PAYOUT_APPROVED",
      userId: admin.id,
      entityType: "Payout",
      entityId: payout.id,
      beforeState: { status: "PENDING" },
      afterState: {
        status: "COMPLETED",
        stripePayoutId: transfer.id,
        amount: payout.amount.toString(),
        placement: entitlement.placement,
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });
  });

  return NextResponse.json({ ok: true });
}
