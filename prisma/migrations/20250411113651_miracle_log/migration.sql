-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'MIRACLE_LOG';
ALTER TYPE "ActivityType" ADD VALUE 'PROGRESS_VAULT';

-- CreateTable
CREATE TABLE "MiracleLog" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "jpPointsAssigned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MiracleLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressVault" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "jpPointsAssigned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProgressVault_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MiracleLog" ADD CONSTRAINT "MiracleLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressVault" ADD CONSTRAINT "ProgressVault_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
