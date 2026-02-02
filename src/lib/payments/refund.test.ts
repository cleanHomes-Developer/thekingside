import { describe, expect, it } from "vitest";
import { canRefundEntry } from "./refund";

describe("refund rules", () => {
  it("allows refunds before lock for registration tournaments", () => {
    const entry = { status: "CONFIRMED" } as const;
    const tournament = {
      status: "REGISTRATION",
      lockAt: new Date("2030-01-01T12:00:00.000Z"),
    } as const;
    const now = new Date("2030-01-01T11:59:00.000Z");

    expect(canRefundEntry(entry as never, tournament as never, now)).toBe(true);
  });

  it("blocks refunds after lock", () => {
    const entry = { status: "CONFIRMED" } as const;
    const tournament = {
      status: "REGISTRATION",
      lockAt: new Date("2030-01-01T12:00:00.000Z"),
    } as const;
    const now = new Date("2030-01-01T12:00:30.000Z");

    expect(canRefundEntry(entry as never, tournament as never, now)).toBe(false);
  });
});
