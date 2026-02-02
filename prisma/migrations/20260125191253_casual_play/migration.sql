-- CreateEnum
CREATE TYPE "CasualQueueStatus" AS ENUM ('QUEUED', 'MATCHED', 'LEFT');

-- CreateEnum
CREATE TYPE "CasualMatchStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABORTED');

-- CreateEnum
CREATE TYPE "CasualMatchResult" AS ENUM ('WHITE', 'BLACK', 'DRAW', 'ABORTED');

-- CreateTable
CREATE TABLE "CasualPlayer" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "guestKey" TEXT,
    "displayName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 1200,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CasualPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasualQueueEntry" (
    "id" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "status" "CasualQueueStatus" NOT NULL DEFAULT 'QUEUED',
    "ratingSnapshot" INTEGER NOT NULL,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "matchedAt" TIMESTAMP(3),
    "matchId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CasualQueueEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasualMatch" (
    "id" UUID NOT NULL,
    "playerWhiteId" UUID NOT NULL,
    "playerBlackId" UUID NOT NULL,
    "status" "CasualMatchStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "result" "CasualMatchResult",
    "timeControl" TEXT NOT NULL DEFAULT '3+3',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "ratingChangeWhite" INTEGER,
    "ratingChangeBlack" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CasualMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CasualMove" (
    "id" UUID NOT NULL,
    "matchId" UUID NOT NULL,
    "ply" INTEGER NOT NULL,
    "san" TEXT NOT NULL,
    "uci" TEXT NOT NULL,
    "fen" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CasualMove_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CasualPlayer_guestKey_key" ON "CasualPlayer"("guestKey");

-- CreateIndex
CREATE INDEX "CasualPlayer_rating_idx" ON "CasualPlayer"("rating");

-- CreateIndex
CREATE UNIQUE INDEX "CasualPlayer_userId_key" ON "CasualPlayer"("userId");

-- CreateIndex
CREATE INDEX "CasualQueueEntry_status_queuedAt_idx" ON "CasualQueueEntry"("status", "queuedAt");

-- CreateIndex
CREATE INDEX "CasualQueueEntry_playerId_idx" ON "CasualQueueEntry"("playerId");

-- CreateIndex
CREATE INDEX "CasualMatch_status_startedAt_idx" ON "CasualMatch"("status", "startedAt");

-- CreateIndex
CREATE INDEX "CasualMove_matchId_idx" ON "CasualMove"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "CasualMove_matchId_ply_key" ON "CasualMove"("matchId", "ply");

-- AddForeignKey
ALTER TABLE "CasualPlayer" ADD CONSTRAINT "CasualPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasualQueueEntry" ADD CONSTRAINT "CasualQueueEntry_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "CasualPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasualQueueEntry" ADD CONSTRAINT "CasualQueueEntry_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "CasualMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasualMatch" ADD CONSTRAINT "CasualMatch_playerWhiteId_fkey" FOREIGN KEY ("playerWhiteId") REFERENCES "CasualPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasualMatch" ADD CONSTRAINT "CasualMatch_playerBlackId_fkey" FOREIGN KEY ("playerBlackId") REFERENCES "CasualPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CasualMove" ADD CONSTRAINT "CasualMove_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "CasualMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
