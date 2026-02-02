-- AlterEnum
ALTER TYPE "EntryStatus" ADD VALUE 'WAITLIST';

-- AlterTable
ALTER TABLE "Entry" ADD COLUMN     "checkedInAt" TIMESTAMP(3);
