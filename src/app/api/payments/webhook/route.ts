import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/payments/stripe";
import {
  calculateEntryAllocation,
  createLedgerEntries,
} from "@/lib/payments/ledger";
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
    const entryId = session.metadata?.entryId;
    const paymentIntentId = session.payment_intent?.toString() ?? null;
    if (entryId) {
      let stripeFee = new Prisma.Decimal(0);
      if (paymentIntentId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId,
          {
            expand: ["charges.data.balance_transaction"],
          },
        );
        const charge = paymentIntent.charges?.data?.[0];
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
            amount: allocation.entryFee,
            description: `Entry fee received for ${entry.id}`,
            relatedUserId: entry.userId,
          },
          {
            type: "PLATFORM_FEE",
            amount: allocation.platformShare.mul(-1),
            description: `Platform fee for ${entry.id}`,
            relatedUserId: entry.userId,
          },
          {
            type: "STRIPE_FEE",
            amount: stripeFee.mul(-1),
            description: `Stripe fee for ${entry.id}`,
            relatedUserId: entry.userId,
          },
        ]);
      });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const entryId = session.metadata?.entryId;
    if (entryId) {
      await prisma.$transaction(async (tx) => {
        const entry = await tx.entry.findUnique({ where: { id: entryId } });
        if (!entry || entry.status !== "PENDING") {
          return;
        }
        await tx.entry.update({
          where: { id: entryId },
          data: { status: "CANCELLED" },
        });
        await tx.tournament.update({
          where: { id: entry.tournamentId },
          data: { currentPlayers: { decrement: 1 } },
        });
      });
    }
  }

  return NextResponse.json({ received: true });
}
