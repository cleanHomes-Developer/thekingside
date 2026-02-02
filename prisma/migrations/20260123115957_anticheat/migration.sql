-- CreateEnum
CREATE TYPE "AntiCheatCaseStatus" AS ENUM ('SOFT_FLAG', 'HARD_FLAG', 'APPEALED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "AntiCheatRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "AntiCheatCase" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tournamentId" UUID NOT NULL,
    "matchId" UUID,
    "status" "AntiCheatCaseStatus" NOT NULL DEFAULT 'SOFT_FLAG',
    "riskLevel" "AntiCheatRiskLevel" NOT NULL DEFAULT 'LOW',
    "evidence" TEXT NOT NULL,
    "appealText" TEXT,
    "adminNotes" TEXT,
    "resolvedBy" UUID,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AntiCheatCase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AntiCheatCase" ADD CONSTRAINT "AntiCheatCase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AntiCheatCase" ADD CONSTRAINT "AntiCheatCase_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AntiCheatCase" ADD CONSTRAINT "AntiCheatCase_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;
