-- AlterEnum
ALTER TYPE "ActivityType" ADD VALUE 'MAGIC_BOX';

-- CreateTable
CREATE TABLE "MagicBox" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isOpened" BOOLEAN NOT NULL DEFAULT false,
    "jpAmount" INTEGER,
    "openedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextBoxAt" TIMESTAMP(3) NOT NULL,
    "randomUserIds" TEXT[],
    "selectedUserId" TEXT,
    "isRedeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemedAt" TIMESTAMP(3),

    CONSTRAINT "MagicBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicBoxSettings" (
    "id" TEXT NOT NULL,
    "minJpAmount" INTEGER NOT NULL DEFAULT 100,
    "maxJpAmount" INTEGER NOT NULL DEFAULT 500,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MagicBoxSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MagicBox_userId_idx" ON "MagicBox"("userId");

-- CreateIndex
CREATE INDEX "MagicBox_nextBoxAt_idx" ON "MagicBox"("nextBoxAt");

-- AddForeignKey
ALTER TABLE "MagicBox" ADD CONSTRAINT "MagicBox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
