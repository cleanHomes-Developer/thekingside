-- AlterTable
ALTER TABLE "CasualMatch" ADD COLUMN     "masteryEvaluatedAt" TIMESTAMP(3),
ADD COLUMN     "takebackOfferedAt" TIMESTAMP(3),
ADD COLUMN     "takebackOfferedById" UUID;

-- CreateTable
CREATE TABLE "MasteryCategory" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasteryCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterySkill" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "categoryId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "maxLevel" INTEGER NOT NULL DEFAULT 10,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterySkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasteryPlayerSkill" (
    "id" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "lastLeveledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasteryPlayerSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasteryGameEvent" (
    "id" UUID NOT NULL,
    "matchId" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "skillId" UUID NOT NULL,
    "deltaXp" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasteryGameEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasteryFeedback" (
    "id" UUID NOT NULL,
    "matchId" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "summary" TEXT NOT NULL,
    "strengths" JSONB NOT NULL,
    "weaknesses" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasteryFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasteryCategory_key_key" ON "MasteryCategory"("key");

-- CreateIndex
CREATE UNIQUE INDEX "MasterySkill_key_key" ON "MasterySkill"("key");

-- CreateIndex
CREATE INDEX "MasteryPlayerSkill_playerId_idx" ON "MasteryPlayerSkill"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "MasteryPlayerSkill_playerId_skillId_key" ON "MasteryPlayerSkill"("playerId", "skillId");

-- CreateIndex
CREATE INDEX "MasteryGameEvent_matchId_playerId_idx" ON "MasteryGameEvent"("matchId", "playerId");

-- CreateIndex
CREATE INDEX "MasteryGameEvent_playerId_idx" ON "MasteryGameEvent"("playerId");

-- CreateIndex
CREATE INDEX "MasteryFeedback_matchId_playerId_idx" ON "MasteryFeedback"("matchId", "playerId");

-- CreateIndex
CREATE INDEX "MasteryFeedback_playerId_idx" ON "MasteryFeedback"("playerId");

-- AddForeignKey
ALTER TABLE "MasterySkill" ADD CONSTRAINT "MasterySkill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "MasteryCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasteryPlayerSkill" ADD CONSTRAINT "MasteryPlayerSkill_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "CasualPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasteryPlayerSkill" ADD CONSTRAINT "MasteryPlayerSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "MasterySkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasteryGameEvent" ADD CONSTRAINT "MasteryGameEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "CasualMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasteryGameEvent" ADD CONSTRAINT "MasteryGameEvent_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "CasualPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasteryGameEvent" ADD CONSTRAINT "MasteryGameEvent_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "MasterySkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasteryFeedback" ADD CONSTRAINT "MasteryFeedback_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "CasualMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasteryFeedback" ADD CONSTRAINT "MasteryFeedback_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "CasualPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
