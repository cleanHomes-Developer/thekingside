import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { isRequestFromAllowedOrigin } from "@/lib/auth/origin";
import { getStripeClient } from "@/lib/payments/stripe";

export async function POST(request: NextRequest) {
  if (!isRequestFromAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stripe = getStripeClient();
  if (!stripe || !process.env.STRIPE_CONNECT_CLIENT_ID) {
    return NextResponse.json(
      { error: "Stripe Connect not configured" },
      { status: 503 },
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  let accountId = profile?.stripeConnectAccountId ?? null;
  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    accountId = account.id;
    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        stripeConnectAccountId: accountId,
        stripeConnectStatus: "PENDING",
        stripeConnectLinkedAt: new Date(),
      },
    });
  }

  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/wallet?connect=return`;
  const refreshUrl = `${process.env.NEXT_PUBLIC_APP_URL}/wallet?connect=refresh`;
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: link.url });
}
