-- CreateEnum
CREATE TYPE "StreakType" AS ENUM ('MIRACLE_LOG', 'PROGRESS_VAULT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'MIRACLE_STREAK_REWARD_7_DAYS';
ALTER TYPE "ActivityType" ADD VALUE 'MIRACLE_STREAK_REWARD_21_DAYS';
ALTER TYPE "ActivityType" ADD VALUE 'MIRACLE_STREAK_REWARD_45_DAYS';
ALTER TYPE "ActivityType" ADD VALUE 'MIRACLE_STREAK_REWARD_90_DAYS';
ALTER TYPE "ActivityType" ADD VALUE 'PROGRESS_VAULT_STREAK_REWARD_7_DAYS';
ALTER TYPE "ActivityType" ADD VALUE 'PROGRESS_VAULT_STREAK_REWARD_21_DAYS';
ALTER TYPE "ActivityType" ADD VALUE 'PROGRESS_VAULT_STREAK_REWARD_45_DAYS';
ALTER TYPE "ActivityType" ADD VALUE 'PROGRESS_VAULT_STREAK_REWARD_90_DAYS';

-- CreateTable
CREATE TABLE "Streak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "StreakType" NOT NULL,
    "miracle_log_count" INTEGER NOT NULL DEFAULT 0,
    "progress_vault_count" INTEGER NOT NULL DEFAULT 0,
    "miracle_log_last_at" TIMESTAMP(3),
    "progress_vault_last_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Streak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreakHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "StreakType" NOT NULL,
    "count" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreakHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Streak_userId_type_key" ON "Streak"("userId", "type");

-- CreateIndex
CREATE INDEX "StreakHistory_userId_type_idx" ON "StreakHistory"("userId", "type");

-- AddForeignKey
ALTER TABLE "Streak" ADD CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreakHistory" ADD CONSTRAINT "StreakHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
