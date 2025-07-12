/*
  Warnings:

  - The values [PENDING,IN_PROGRESS,EXPIRED] on the enum `BuddyLensRequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PENDING,REJECTED,APPROVED] on the enum `BuddyLensReviewStatus` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `feedbackType` to the `BuddyLensRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'BUDDY_LENS_REQUEST';
ALTER TYPE "ActivityType" ADD VALUE 'BUDDY_LENS_REVIEW';

-- AlterEnum
BEGIN;
CREATE TYPE "BuddyLensRequestStatus_new" AS ENUM ('OPEN', 'CLAIMED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "BuddyLensRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "BuddyLensRequest" ALTER COLUMN "status" TYPE "BuddyLensRequestStatus_new" USING ("status"::text::"BuddyLensRequestStatus_new");
ALTER TYPE "BuddyLensRequestStatus" RENAME TO "BuddyLensRequestStatus_old";
ALTER TYPE "BuddyLensRequestStatus_new" RENAME TO "BuddyLensRequestStatus";
DROP TYPE "BuddyLensRequestStatus_old";
ALTER TABLE "BuddyLensRequest" ALTER COLUMN "status" SET DEFAULT 'OPEN';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "BuddyLensReviewStatus_new" AS ENUM ('DRAFT', 'SUBMITTED', 'REPORTED');
ALTER TABLE "BuddyLensReview" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "BuddyLensReview" ALTER COLUMN "status" TYPE "BuddyLensReviewStatus_new" USING ("status"::text::"BuddyLensReviewStatus_new");
ALTER TYPE "BuddyLensReviewStatus" RENAME TO "BuddyLensReviewStatus_old";
ALTER TYPE "BuddyLensReviewStatus_new" RENAME TO "BuddyLensReviewStatus";
DROP TYPE "BuddyLensReviewStatus_old";
ALTER TABLE "BuddyLensReview" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "BuddyLensRequest" ADD COLUMN     "feedbackType" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tier" TEXT NOT NULL DEFAULT '5min',
ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "BuddyLensReview" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
