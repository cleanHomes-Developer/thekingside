import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { getStripeClient } from "@/lib/payments/stripe";
import { createLedgerEntries } from "@/lib/payments/ledger";
import { getSeasonConfig } from "@/lib/season";
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

  const profile = await prisma.profile.findUnique({
    where: { userId: payout.userId },
  });
  if (!profile?.stripeConnectAccountId) {
    return NextResponse.json(
      { error: "User not connected to Stripe" },
      { status: 400 },
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const transfer = await stripe.transfers.create({
    amount: Math.round(Number(payout.amount) * 100),
    currency: "usd",
    destination: profile.stripeConnectAccountId,
  });

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
      },
    ]);
  });

  return NextResponse.json({ ok: true });
}
