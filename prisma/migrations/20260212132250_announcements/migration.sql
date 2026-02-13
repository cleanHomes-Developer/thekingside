-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- AlterTable
ALTER TABLE "AdminAnnouncement" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AnnouncementDelivery" ALTER COLUMN "id" DROP DEFAULT;
