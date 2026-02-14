import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/payments/stripe";
import {
  calculateEntryAllocation,
  createLedgerEntries,
} from "@/lib/payments/ledger";
import { extractCheckoutSessionDetails } from "@/lib/payments/webhook";
import { getRequestMeta, logAuditEvent } from "@/lib/audit";
import { Prisma } from "@prisma/client";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { entryId, paymentIntentId } = extractCheckoutSessionDetails(session);
    if (entryId) {
      const requestMeta = getRequestMeta(request);
      let stripeFee = new Prisma.Decimal(0);
      if (paymentIntentId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId,
          {
            expand: ["charges.data.balance_transaction"],
          },
        );
        const charge = (paymentIntent as any).charges?.data?.[0];
        const balanceTransaction = charge?.balance_transaction as
          | Stripe.BalanceTransaction
          | null;
        if (balanceTransaction?.fee) {
          stripeFee = new Prisma.Decimal(balanceTransaction.fee).div(100);
        }
      }

      await prisma.$transaction(async (tx) => {
        const entry = await tx.entry.findUnique({
          where: { id: entryId },
          include: { tournament: true },
        });
        if (!entry || entry.status === "CONFIRMED") {
          return;
        }
        const beforeState = {
          status: entry.status,
          paidAt: entry.paidAt,
          paymentIntentId: entry.paymentIntentId,
        };

        const allocation = calculateEntryAllocation(
          new Prisma.Decimal(entry.tournament.entryFee),
        );

        await tx.entry.update({
          where: { id: entryId },
          data: {
            status: "CONFIRMED",
            paidAt: new Date(),
            paymentIntentId,
          },
        });

        await tx.tournament.update({
          where: { id: entry.tournamentId },
          data: {
            prizePool: { increment: allocation.prizeShare },
          },
        });

        await createLedgerEntries(tx, entry.tournamentId, [
          {
            type: "ENTRY_FEE",
            amount: allocation.prizeShare,
            description: `Entry fee received for ${entry.id}`,
            relatedUserId: entry.userId,
            affectsBalance: true,
          },
          {
            type: "PLATFORM_FEE",
            amount: allocation.platformShare,
            description: `Platform fee for ${entry.id}`,
            relatedUserId: entry.userId,
            affectsBalance: false,
          },
          {
            type: "STRIPE_FEE",
            amount: stripeFee.mul(-1),
            description: `Stripe fee for ${entry.id}`,
            relatedUserId: entry.userId,
            affectsBalance: false,
          },
        ]);

        await logAuditEvent(tx, {
          action: "ENTRY_CONFIRMED",
          userId: entry.userId,
          entityType: "Entry",
          entityId: entry.id,
          beforeState,
          afterState: {
            status: "CONFIRMED",
            paidAt: new Date().toISOString(),
            paymentIntentId,
            prizeShare: allocation.prizeShare.toString(),
            platformShare: allocation.platformShare.toString(),
            stripeFee: stripeFee.toString(),
          },
          ipAddress: requestMeta.ipAddress,
          userAgent: requestMeta.userAgent,
        });
      });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const entryId = session.metadata?.entryId;
    if (entryId) {
      const requestMeta = getRequestMeta(request);
      await prisma.$transaction(async (tx) => {
        const entry = await tx.entry.findUnique({ where: { id: entryId } });
        if (!entry || entry.status !== "PENDING") {
          return;
        }
        const beforeState = { status: entry.status };
        await tx.entry.update({
          where: { id: entryId },
          data: { status: "CANCELLED" },
        });
        await tx.tournament.update({
          where: { id: entry.tournamentId },
          data: { currentPlayers: { decrement: 1 } },
        });

        await logAuditEvent(tx, {
          action: "ENTRY_EXPIRED",
          userId: entry.userId,
          entityType: "Entry",
          entityId: entry.id,
          beforeState,
          afterState: { status: "CANCELLED" },
          ipAddress: requestMeta.ipAddress,
          userAgent: requestMeta.userAgent,
        });
      });
    }
  }

  return NextResponse.json({ received: true });
}
