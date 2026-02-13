import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { canRefundEntry } from "@/lib/payments/refund";
import { getStripeClient } from "@/lib/payments/stripe";
import {
  calculateEntryAllocation,
  createLedgerEntries,
} from "@/lib/payments/ledger";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";
import { Prisma } from "@prisma/client";

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

  const entryId = (payload as { entryId?: string }).entryId;
  if (!entryId) {
    return NextResponse.json({ error: "entryId is required" }, { status: 400 });
  }

  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    include: { tournament: true },
  });

  if (!entry || entry.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const now = new Date();
  if (!canRefundEntry(entry, entry.tournament, now)) {
    return NextResponse.json(
      { error: "Refund not allowed after lock" },
      { status: 400 },
    );
  }

  if (entry.paymentIntentId && !entry.paymentIntentId.startsWith("dev-")) {
    const stripe = getStripeClient();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 },
      );
    }
    await stripe.refunds.create({ payment_intent: entry.paymentIntentId });
  }

  const requestMeta = getRequestMeta(request);
  await prisma.$transaction(async (tx) => {
    const allocation = calculateEntryAllocation(
      new Prisma.Decimal(entry.tournament.entryFee),
    );

    const beforeState = {
      status: entry.status,
      paidAt: entry.paidAt,
      paymentIntentId: entry.paymentIntentId,
    };
    await tx.entry.update({
      where: { id: entry.id },
      data: { status: "CANCELLED" },
    });
    await tx.tournament.update({
      where: { id: entry.tournamentId },
      data: {
        currentPlayers: { decrement: 1 },
        prizePool: { decrement: allocation.prizeShare },
      },
    });

    await createLedgerEntries(tx, entry.tournamentId, [
      {
        type: "REFUND",
        amount: allocation.prizeShare.mul(-1),
        description: `Refund issued for ${entry.id}`,
        relatedUserId: entry.userId,
        affectsBalance: true,
      },
    ]);

    await logAuditEvent(tx, {
      action: "ENTRY_REFUND",
      userId: entry.userId,
      entityType: "Entry",
      entityId: entry.id,
      beforeState,
      afterState: {
        status: "CANCELLED",
        refundedAt: new Date().toISOString(),
        prizeShare: allocation.prizeShare.toString(),
      },
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });
  });

  return NextResponse.json({ ok: true });
}
