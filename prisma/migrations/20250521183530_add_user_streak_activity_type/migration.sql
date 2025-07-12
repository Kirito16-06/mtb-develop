-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'STREAK_7_DAYS';
ALTER TYPE "ActivityType" ADD VALUE 'STREAK_21_DAYS';
ALTER TYPE "ActivityType" ADD VALUE 'STREAK_45_DAYS';
ALTER TYPE "ActivityType" ADD VALUE 'STREAK_90_DAYS';

-- AddForeignKey
ALTER TABLE "UserStreak" ADD CONSTRAINT "UserStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
