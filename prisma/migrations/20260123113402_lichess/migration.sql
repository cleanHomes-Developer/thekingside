-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "lichessAccessToken" TEXT,
ADD COLUMN     "lichessLinkedAt" TIMESTAMP(3),
ADD COLUMN     "lichessTokenCreatedAt" TIMESTAMP(3),
ADD COLUMN     "lichessUserId" TEXT;
