/*
  Warnings:

  - You are about to drop the column `notes` on the `AlignedAction` table. All the data in the column will be lost.
  - You are about to drop the column `reminderTime` on the `AlignedAction` table. All the data in the column will be lost.
  - You are about to drop the column `scheduledTime` on the `AlignedAction` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryTime` on the `AlignedAction` table. All the data in the column will be lost.
  - You are about to drop the column `selectedOption` on the `AlignedAction` table. All the data in the column will be lost.
  - You are about to drop the column `summaryType` on the `AlignedAction` table. All the data in the column will be lost.
  - You are about to drop the column `taskTypes` on the `AlignedAction` table. All the data in the column will be lost.
  - Added the required column `category` to the `AlignedAction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selectedTask` to the `AlignedAction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeFrom` to the `AlignedAction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeTo` to the `AlignedAction` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AlignedAction_scheduledTime_idx";

-- DropIndex
DROP INDEX "AlignedAction_userId_idx";

-- AlterTable
ALTER TABLE "AlignedAction" DROP COLUMN "notes",
DROP COLUMN "reminderTime",
DROP COLUMN "scheduledTime",
DROP COLUMN "secondaryTime",
DROP COLUMN "selectedOption",
DROP COLUMN "summaryType",
DROP COLUMN "taskTypes",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "selectedTask" TEXT NOT NULL,
ADD COLUMN     "tasks" TEXT[],
ADD COLUMN     "timeFrom" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "timeTo" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "AlignedAction_userId_createdAt_idx" ON "AlignedAction"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AlignedAction_timeFrom_idx" ON "AlignedAction"("timeFrom");
