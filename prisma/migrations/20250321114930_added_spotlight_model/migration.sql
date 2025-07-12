-- CreateEnum
CREATE TYPE "SpotlightStatus" AS ENUM ('APPLIED', 'IN_REVIEW', 'APPROVED', 'DISAPPROVED');

-- CreateTable
CREATE TABLE "Spotlight" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "jpUsed" INTEGER NOT NULL,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SpotlightStatus" NOT NULL DEFAULT 'APPLIED',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "defaultDurationDays" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Spotlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Spotlight_userId_key" ON "Spotlight"("userId");

-- CreateIndex
CREATE INDEX "Spotlight_expiresAt_idx" ON "Spotlight"("expiresAt");

-- AddForeignKey
ALTER TABLE "Spotlight" ADD CONSTRAINT "Spotlight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
