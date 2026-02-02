import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { calculateEntryAllocation } from "./ledger";

describe("ledger allocation", () => {
  it("splits entry fee into 75/25", () => {
    const allocation = calculateEntryAllocation(new Prisma.Decimal("10.00"));
    expect(allocation.prizeShare.toString()).toBe("7.5");
    expect(allocation.platformShare.toString()).toBe("2.5");
  });
});
