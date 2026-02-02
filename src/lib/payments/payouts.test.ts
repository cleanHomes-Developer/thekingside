import { describe, expect, it } from "vitest";
import { canRequestPayout, hasAntiCheatHold } from "./payouts";

describe("payout gating", () => {
  it("requires KYC verification", () => {
    expect(canRequestPayout("PENDING" as never, false)).toBe(false);
    expect(canRequestPayout("VERIFIED" as never, false)).toBe(true);
  });

  it("blocks payouts when anti-cheat holds exist", () => {
    expect(
      hasAntiCheatHold([{ status: "SOFT_FLAG" } as never]),
    ).toBe(true);
    expect(
      hasAntiCheatHold([{ status: "RESOLVED" } as never]),
    ).toBe(false);
  });
});
