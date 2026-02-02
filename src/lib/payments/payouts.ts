import type { KycStatus, AntiCheatCase } from "@prisma/client";

export function hasAntiCheatHold(cases: AntiCheatCase[]) {
  return cases.some((caseItem) =>
    ["SOFT_FLAG", "HARD_FLAG", "APPEALED"].includes(caseItem.status),
  );
}

export function canRequestPayout(kycStatus: KycStatus, hasHold: boolean) {
  return kycStatus === "VERIFIED" && !hasHold;
}
