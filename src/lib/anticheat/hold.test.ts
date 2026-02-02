import { describe, expect, it } from "vitest";
import { isCaseHolding } from "./hold";

describe("anti-cheat hold", () => {
  it("returns true for active flags", () => {
    expect(isCaseHolding({ status: "SOFT_FLAG" } as never)).toBe(true);
    expect(isCaseHolding({ status: "HARD_FLAG" } as never)).toBe(true);
    expect(isCaseHolding({ status: "APPEALED" } as never)).toBe(true);
  });

  it("returns false for resolved statuses", () => {
    expect(isCaseHolding({ status: "RESOLVED" } as never)).toBe(false);
    expect(isCaseHolding({ status: "DISMISSED" } as never)).toBe(false);
  });
});
