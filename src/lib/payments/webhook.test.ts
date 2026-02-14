import { describe, expect, it } from "vitest";
import { extractCheckoutSessionDetails } from "./webhook";

describe("extractCheckoutSessionDetails", () => {
  it("returns entry id and payment intent", () => {
    const result = extractCheckoutSessionDetails({
      metadata: { entryId: "entry-123" },
      payment_intent: "pi_abc",
    });
    expect(result).toEqual({ entryId: "entry-123", paymentIntentId: "pi_abc" });
  });

  it("coerces numeric payment intent", () => {
    const result = extractCheckoutSessionDetails({
      metadata: { entryId: "entry-456" },
      payment_intent: 12345,
    });
    expect(result).toEqual({ entryId: "entry-456", paymentIntentId: "12345" });
  });

  it("handles missing metadata", () => {
    const result = extractCheckoutSessionDetails({
      metadata: {},
      payment_intent: null,
    });
    expect(result).toEqual({ entryId: null, paymentIntentId: null });
  });

  it("handles invalid payloads", () => {
    const result = extractCheckoutSessionDetails("invalid");
    expect(result).toEqual({ entryId: null, paymentIntentId: null });
  });
});
