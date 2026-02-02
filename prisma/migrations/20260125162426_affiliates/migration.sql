/*
  Warnings:

  - The values [GAMING_HARDWARE,GAMING_PLATFORMS,STREAMING_CONTENT,GAME_KEYS] on the enum `AffiliateCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `active` on the `AffiliateProgram` table. All the data in the column will be lost.
  - You are about to drop the column `commissionRate` on the `AffiliateProgram` table. All the data in the column will be lost.
  - You are about to drop the column `websiteUrl` on the `AffiliateProgram` table. All the data in the column will be lost.
  - Added the required column `commissionRange` to the `AffiliateProgram` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commissionType` to the `AffiliateProgram` table without a default value. This is not possible if the table is not empty.
  - Made the column `affiliateUrl` on table `AffiliateProgram` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AffiliateCommissionType" AS ENUM ('PERCENT', 'FLAT', 'VARIABLE');

-- AlterEnum
BEGIN;
CREATE TYPE "AffiliateCategory_new" AS ENUM ('HARDWARE', 'PLATFORMS', 'STREAMING', 'MARKETPLACES', 'GENERAL');
ALTER TABLE "AffiliateProgram" ALTER COLUMN "category" TYPE "AffiliateCategory_new" USING ("category"::text::"AffiliateCategory_new");
ALTER TYPE "AffiliateCategory" RENAME TO "AffiliateCategory_old";
ALTER TYPE "AffiliateCategory_new" RENAME TO "AffiliateCategory";
DROP TYPE "AffiliateCategory_old";
COMMIT;

-- DropIndex
DROP INDEX "AffiliateProgram_active_sortOrder_idx";

-- DropIndex
DROP INDEX "AffiliateProgram_category_idx";

-- DropIndex
DROP INDEX "AffiliateProgram_name_key";

-- AlterTable
ALTER TABLE "AffiliateProgram" DROP COLUMN "active",
DROP COLUMN "commissionRate",
DROP COLUMN "websiteUrl",
ADD COLUMN     "commissionRange" TEXT NOT NULL,
ADD COLUMN     "commissionType" "AffiliateCommissionType" NOT NULL,
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "affiliateUrl" SET NOT NULL;

-- CreateTable
CREATE TABLE "AffiliateClick" (
    "id" UUID NOT NULL,
    "programId" UUID NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffiliateClick_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AffiliateClick_programId_createdAt_idx" ON "AffiliateClick"("programId", "createdAt");

-- CreateIndex
CREATE INDEX "AffiliateProgram_category_enabled_sortOrder_idx" ON "AffiliateProgram"("category", "enabled", "sortOrder");

-- AddForeignKey
ALTER TABLE "AffiliateClick" ADD CONSTRAINT "AffiliateClick_programId_fkey" FOREIGN KEY ("programId") REFERENCES "AffiliateProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;
