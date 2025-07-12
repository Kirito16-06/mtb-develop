/*
  Warnings:

  - You are about to drop the column `feedbackType` on the `BuddyLensRequest` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `BuddyLensRequest` table. All the data in the column will be lost.
  - The `questions` column on the `BuddyLensRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `answers` column on the `BuddyLensReview` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `domain` to the `BuddyLensRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `BuddyLensRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewText` to the `BuddyLensReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewerId` to the `BuddyLensReview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


-- ALTER TYPE "ActivityType" ADD VALUE 'BUDDY_LENS_REQUEST';
-- ALTER TYPE "ActivityType" ADD VALUE 'BUDDY_LENS_REVIEW';

-- AlterEnum
ALTER TYPE "BuddyLensRequestStatus" ADD VALUE 'PENDING';

-- AlterTable
ALTER TABLE "BuddyLensRequest" DROP COLUMN "feedbackType",
DROP COLUMN "tags",
ADD COLUMN     "domain" TEXT NOT NULL,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pendingReviewerId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "questions",
ADD COLUMN     "questions" TEXT[],
ALTER COLUMN "expiresAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "BuddyLensReview" ADD COLUMN     "reviewText" TEXT NOT NULL,
ADD COLUMN     "reviewerId" TEXT NOT NULL,
DROP COLUMN "answers",
ADD COLUMN     "answers" TEXT[];

-- CreateTable
CREATE TABLE "UserNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "link" TEXT,

    CONSTRAINT "UserNotification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BuddyLensRequest" ADD CONSTRAINT "BuddyLensRequest_pendingReviewerId_fkey" FOREIGN KEY ("pendingReviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddyLensReview" ADD CONSTRAINT "BuddyLensReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotification" ADD CONSTRAINT "UserNotification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
