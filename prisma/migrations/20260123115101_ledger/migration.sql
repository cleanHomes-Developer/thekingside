-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('ENTRY_FEE', 'PLATFORM_FEE', 'STRIPE_FEE', 'PAYOUT', 'REFUND');

-- CreateTable
CREATE TABLE "PrizePoolLedger" (
    "id" UUID NOT NULL,
    "tournamentId" UUID NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT NOT NULL,
    "relatedUserId" UUID,
    "relatedPayoutId" TEXT,
    "balance" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrizePoolLedger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrizePoolLedger_tournamentId_createdAt_idx" ON "PrizePoolLedger"("tournamentId", "createdAt");

-- AddForeignKey
ALTER TABLE "PrizePoolLedger" ADD CONSTRAINT "PrizePoolLedger_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
