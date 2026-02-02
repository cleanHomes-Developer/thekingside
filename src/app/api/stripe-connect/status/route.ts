import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { getStripeClient } from "@/lib/payments/stripe";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  if (!profile?.stripeConnectAccountId) {
    return NextResponse.json({ connected: false });
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const account = await stripe.accounts.retrieve(
    profile.stripeConnectAccountId,
  );
  const connected =
    account.details_submitted && account.charges_enabled && account.payouts_enabled;

  await prisma.profile.update({
    where: { userId: user.id },
    data: {
      stripeConnectStatus: connected ? "VERIFIED" : "PENDING",
    },
  });

  return NextResponse.json({
    connected,
    accountId: profile.stripeConnectAccountId,
  });
}
