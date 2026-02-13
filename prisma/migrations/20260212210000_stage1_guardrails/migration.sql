-- AlterEnum
ALTER TYPE "LedgerEntryType" ADD VALUE IF NOT EXISTS 'SEED';

-- AlterTable
ALTER TABLE "Payout" ADD COLUMN     "entitlementAmount" DECIMAL(12,2),
ADD COLUMN     "placement" INTEGER;

-- DropIndex
DROP INDEX IF EXISTS "Payout_userId_tournamentId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Payout_userId_tournamentId_key" ON "Payout"("userId", "tournamentId");

-- CreateIndex
CREATE INDEX "Payout_tournamentId_status_idx" ON "Payout"("tournamentId", "status");

-- CreateTable
CREATE TABLE IF NOT EXISTS "PayoutSchedule" (
    "id" UUID NOT NULL,
    "tournamentId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "percent" DECIMAL(5,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "PayoutSchedule_tournamentId_position_key" ON "PayoutSchedule"("tournamentId", "position");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayoutSchedule_tournamentId_idx" ON "PayoutSchedule"("tournamentId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "userId" UUID,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "beforeState" JSONB,
    "afterState" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_createdAt_idx" ON "AuditLog"("entityType", "createdAt");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PayoutSchedule_tournamentId_fkey') THEN
    ALTER TABLE "PayoutSchedule" ADD CONSTRAINT "PayoutSchedule_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'AuditLog_userId_fkey') THEN
    ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
