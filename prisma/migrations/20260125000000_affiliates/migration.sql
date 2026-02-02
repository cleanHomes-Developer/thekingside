-- CreateEnum
CREATE TYPE "AffiliateCategory" AS ENUM (
  'GAMING_HARDWARE',
  'GAMING_PLATFORMS',
  'STREAMING_CONTENT',
  'GAME_KEYS',
  'GENERAL'
);

-- CreateTable
CREATE TABLE "AffiliateProgram" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "category" "AffiliateCategory" NOT NULL,
  "commissionRate" TEXT NOT NULL,
  "cookieDuration" TEXT NOT NULL,
  "notes" TEXT,
  "websiteUrl" TEXT,
  "affiliateUrl" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AffiliateProgram_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateProgram_name_key" ON "AffiliateProgram"("name");

-- CreateIndex
CREATE INDEX "AffiliateProgram_active_sortOrder_idx" ON "AffiliateProgram"("active", "sortOrder");

-- CreateIndex
CREATE INDEX "AffiliateProgram_category_idx" ON "AffiliateProgram"("category");
