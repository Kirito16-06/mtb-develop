/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `BuddyLensRequest` table. All the data in the column will be lost.
  - You are about to drop the column `pendingReviewerId` on the `BuddyLensRequest` table. All the data in the column will be lost.
  - You are about to drop the column `reviewerId` on the `BuddyLensRequest` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `BuddyLensReview` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[requestId,reviewerId]` on the table `BuddyLensReview` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "BuddyLensReviewStatus" ADD VALUE 'PENDING';

-- DropForeignKey
ALTER TABLE "BuddyLensRequest" DROP CONSTRAINT "BuddyLensRequest_pendingReviewerId_fkey";

-- DropForeignKey
ALTER TABLE "BuddyLensRequest" DROP CONSTRAINT "BuddyLensRequest_reviewerId_fkey";

-- DropIndex
DROP INDEX "BuddyLensRequest_expiresAt_idx";

-- DropIndex
DROP INDEX "BuddyLensRequest_reviewerId_idx";

-- DropIndex
DROP INDEX "BuddyLensReview_requestId_key";

-- AlterTable
ALTER TABLE "BuddyLensRequest" DROP COLUMN "expiresAt",
DROP COLUMN "pendingReviewerId",
DROP COLUMN "reviewerId";

-- AlterTable
ALTER TABLE "BuddyLensReview" DROP COLUMN "status";

-- CreateTable
CREATE TABLE "_BuddyLensReviews" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BuddyLensReviews_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BuddyLensReviews_B_index" ON "_BuddyLensReviews"("B");

-- CreateIndex
CREATE INDEX "BuddyLensReview_requestId_idx" ON "BuddyLensReview"("requestId");

-- CreateIndex
CREATE INDEX "BuddyLensReview_reviewerId_idx" ON "BuddyLensReview"("reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "BuddyLensReview_requestId_reviewerId_key" ON "BuddyLensReview"("requestId", "reviewerId");

-- AddForeignKey
ALTER TABLE "_BuddyLensReviews" ADD CONSTRAINT "_BuddyLensReviews_A_fkey" FOREIGN KEY ("A") REFERENCES "BuddyLensRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuddyLensReviews" ADD CONSTRAINT "_BuddyLensReviews_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
