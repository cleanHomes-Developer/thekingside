-- DropIndex
DROP INDEX "CasualQueueEntry_status_queuedAt_idx";

-- AlterTable
ALTER TABLE "CasualQueueEntry" ADD COLUMN     "timeControl" TEXT NOT NULL DEFAULT '3+0';

-- CreateIndex
CREATE INDEX "CasualQueueEntry_status_timeControl_queuedAt_idx" ON "CasualQueueEntry"("status", "timeControl", "queuedAt");
