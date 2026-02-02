import { describe, expect, it } from "vitest";
import { calculateEloDelta } from "./ratings";

describe("calculateEloDelta", () => {
  it("awards points to the winner", () => {
    const result = calculateEloDelta(1200, 1200, "WHITE");
    expect(result.whiteDelta).toBeGreaterThan(0);
    expect(result.blackDelta).toBeLessThan(0);
  });

  it("keeps totals near zero for a draw", () => {
    const result = calculateEloDelta(1200, 1200, "DRAW");
    expect(result.whiteDelta + result.blackDelta).toBe(0);
  });
});
