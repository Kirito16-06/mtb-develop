-- AlterTable
ALTER TABLE "BuddyLensRequest" ADD COLUMN     "reviewerId" TEXT;

-- AddForeignKey
ALTER TABLE "BuddyLensRequest" ADD CONSTRAINT "BuddyLensRequest_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
