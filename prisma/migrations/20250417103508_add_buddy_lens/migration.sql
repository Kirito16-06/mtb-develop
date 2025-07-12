/*
  Warnings:

  - A unique constraint covering the columns `[buddyLensRequestId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BuddyLensRequestStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BuddyLensReviewStatus" AS ENUM ('PENDING', 'SUBMITTED', 'REJECTED', 'APPROVED');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "buddyLensRequestId" TEXT;

-- CreateTable
CREATE TABLE "BuddyLensRequest" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "reviewerId" TEXT,
    "socialMediaUrl" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "jpCost" INTEGER NOT NULL,
    "status" "BuddyLensRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BuddyLensRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuddyLensReview" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "status" "BuddyLensReviewStatus" NOT NULL DEFAULT 'PENDING',
    "rating" INTEGER,
    "feedback" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuddyLensReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BuddyLensRequest_requesterId_idx" ON "BuddyLensRequest"("requesterId");

-- CreateIndex
CREATE INDEX "BuddyLensRequest_reviewerId_idx" ON "BuddyLensRequest"("reviewerId");

-- CreateIndex
CREATE INDEX "BuddyLensRequest_status_idx" ON "BuddyLensRequest"("status");

-- CreateIndex
CREATE INDEX "BuddyLensRequest_expiresAt_idx" ON "BuddyLensRequest"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "BuddyLensReview_requestId_key" ON "BuddyLensReview"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_buddyLensRequestId_key" ON "Transaction"("buddyLensRequestId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_buddyLensRequestId_fkey" FOREIGN KEY ("buddyLensRequestId") REFERENCES "BuddyLensRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddyLensRequest" ADD CONSTRAINT "BuddyLensRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddyLensRequest" ADD CONSTRAINT "BuddyLensRequest_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuddyLensReview" ADD CONSTRAINT "BuddyLensReview_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "BuddyLensRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
