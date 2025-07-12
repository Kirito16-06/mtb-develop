-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'ALIGNED_ACTION';

-- CreateTable
CREATE TABLE "AlignedAction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mood" TEXT NOT NULL,
    "notes" TEXT[],
    "summaryType" TEXT NOT NULL,
    "taskTypes" TEXT[],
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "reminderTime" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlignedAction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlignedAction_userId_idx" ON "AlignedAction"("userId");

-- CreateIndex
CREATE INDEX "AlignedAction_scheduledTime_idx" ON "AlignedAction"("scheduledTime");

-- AddForeignKey
ALTER TABLE "AlignedAction" ADD CONSTRAINT "AlignedAction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
