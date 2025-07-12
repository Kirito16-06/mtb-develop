-- AlterTable
ALTER TABLE "BuddyLensReview" ADD COLUMN     "status" "BuddyLensReviewStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "BuddyLensReview_status_idx" ON "BuddyLensReview"("status");
