import { Prisma, type PrismaClient } from "@prisma/client";

const PLATFORM_SHARE = new Prisma.Decimal("0.25");
const PRIZE_SHARE = new Prisma.Decimal("0.75");

export type LedgerInput = {
  type:
    | "ENTRY_FEE"
    | "PLATFORM_FEE"
    | "STRIPE_FEE"
    | "PAYOUT"
    | "REFUND"
    | "SEED";
  amount: Prisma.Decimal;
  description: string;
  relatedUserId?: string | null;
  relatedPayoutId?: string | null;
  affectsBalance?: boolean;
};

export function calculateEntryAllocation(amount: Prisma.Decimal) {
  const entryFee = amount;
  const platformShare = entryFee.mul(PLATFORM_SHARE).toDecimalPlaces(2);
  const prizeShare = entryFee.mul(PRIZE_SHARE).toDecimalPlaces(2);
  return { entryFee, platformShare, prizeShare };
}

type LedgerClient = PrismaClient | Prisma.TransactionClient;

export async function createLedgerEntries(
  tx: LedgerClient,
  tournamentId: string,
  entries: LedgerInput[],
) {
  const lastEntry = await tx.prizePoolLedger.findFirst({
    where: { tournamentId },
    orderBy: { createdAt: "desc" },
  });

  let balance = lastEntry?.balance ?? new Prisma.Decimal(0);
  const created: string[] = [];

  for (const entry of entries) {
    const impacts = entry.affectsBalance ?? true;
    if (impacts) {
      balance = balance.add(entry.amount);
    }
    const createdEntry = await tx.prizePoolLedger.create({
      data: {
        tournamentId,
        type: entry.type,
        amount: entry.amount,
        description: entry.description,
        relatedUserId: entry.relatedUserId ?? undefined,
        relatedPayoutId: entry.relatedPayoutId ?? undefined,
        balance,
      },
      select: { id: true },
    });
    created.push(createdEntry.id);
  }

  return created;
}
