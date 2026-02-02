import type { AntiCheatCase } from "@prisma/client";

export function isCaseHolding(caseItem: AntiCheatCase) {
  return (
    caseItem.status === "SOFT_FLAG" ||
    caseItem.status === "HARD_FLAG" ||
    caseItem.status === "APPEALED"
  );
}
