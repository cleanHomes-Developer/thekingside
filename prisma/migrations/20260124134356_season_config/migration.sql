-- CreateEnum
CREATE TYPE "SeasonMode" AS ENUM ('FREE', 'PAID');

-- CreateTable
CREATE TABLE "SeasonConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "mode" "SeasonMode" NOT NULL DEFAULT 'PAID',
    "freePrizePool" DECIMAL(12,2) NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonConfig_pkey" PRIMARY KEY ("id")
);
