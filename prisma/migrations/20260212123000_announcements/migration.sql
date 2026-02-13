-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "AnnouncementAudience" AS ENUM ('ALL', 'RANDOM', 'SELECTED');

-- CreateEnum
CREATE TYPE "AnnouncementDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "AdminAnnouncement" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "status" "AnnouncementStatus" NOT NULL DEFAULT 'DRAFT',
  "audience" "AnnouncementAudience" NOT NULL DEFAULT 'ALL',
  "audienceFilters" JSONB,
  "createdBy" UUID NOT NULL,
  "scheduledAt" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "sentCount" INTEGER NOT NULL DEFAULT 0,
  "failedCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AdminAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnouncementDelivery" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "announcementId" UUID NOT NULL,
  "userId" UUID,
  "email" TEXT NOT NULL,
  "status" "AnnouncementDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "error" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AnnouncementDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminAnnouncement_status_createdAt_idx" ON "AdminAnnouncement"("status", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAnnouncement_createdBy_createdAt_idx" ON "AdminAnnouncement"("createdBy", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AnnouncementDelivery_announcementId_email_key" ON "AnnouncementDelivery"("announcementId", "email");

-- CreateIndex
CREATE INDEX "AnnouncementDelivery_announcementId_status_idx" ON "AnnouncementDelivery"("announcementId", "status");

-- CreateIndex
CREATE INDEX "AnnouncementDelivery_userId_idx" ON "AnnouncementDelivery"("userId");

-- AddForeignKey
ALTER TABLE "AdminAnnouncement" ADD CONSTRAINT "AdminAnnouncement_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementDelivery" ADD CONSTRAINT "AnnouncementDelivery_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "AdminAnnouncement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnouncementDelivery" ADD CONSTRAINT "AnnouncementDelivery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
