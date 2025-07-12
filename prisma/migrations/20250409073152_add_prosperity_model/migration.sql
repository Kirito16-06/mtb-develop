-- CreateEnum
CREATE TYPE "ProsperityDropStatus" AS ENUM ('APPLIED', 'IN_REVIEW', 'APPROVED', 'DISAPPROVED');

-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'PROSPERITY_DROP';

-- CreateTable
CREATE TABLE "ProsperityDrop" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ProsperityDropStatus" NOT NULL DEFAULT 'APPLIED',

    CONSTRAINT "ProsperityDrop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProsperityDrop_status_idx" ON "ProsperityDrop"("status");

-- AddForeignKey
ALTER TABLE "ProsperityDrop" ADD CONSTRAINT "ProsperityDrop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
