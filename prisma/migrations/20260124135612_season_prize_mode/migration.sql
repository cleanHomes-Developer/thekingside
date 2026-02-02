-- CreateEnum
CREATE TYPE "PrizeMode" AS ENUM ('GIFT_CARD', 'CASH');

-- AlterTable
ALTER TABLE "SeasonConfig" ADD COLUMN     "prizeMode" "PrizeMode" NOT NULL DEFAULT 'GIFT_CARD';
