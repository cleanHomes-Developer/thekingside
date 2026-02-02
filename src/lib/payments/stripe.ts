import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY ?? "";
  if (!secret) {
    return null;
  }

  if (!cached) {
    cached = new Stripe(secret, {
      apiVersion: "2024-06-20",
    });
  }

  return cached;
}

export function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET ?? "";
}

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
