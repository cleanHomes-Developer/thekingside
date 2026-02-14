import { z } from "zod";

type CheckoutSessionDetails = {
  entryId: string | null;
  paymentIntentId: string | null;
};

const metadataSchema = z.record(z.string()).optional();
const sessionSchema = z.object({
  metadata: metadataSchema,
  payment_intent: z.union([z.string(), z.number(), z.null()]).optional(),
});

export function extractCheckoutSessionDetails(
  session: unknown,
): CheckoutSessionDetails {
  const parsed = sessionSchema.safeParse(session);
  if (!parsed.success) {
    return { entryId: null, paymentIntentId: null };
  }
  const entryId = parsed.data.metadata?.entryId ?? null;
  const paymentIntentRaw = parsed.data.payment_intent ?? null;
  const paymentIntentId =
    paymentIntentRaw === null || paymentIntentRaw === undefined
      ? null
      : paymentIntentRaw.toString();
  return { entryId, paymentIntentId };
}
