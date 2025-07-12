-- CreateEnum
CREATE TYPE "BreathWorkType" AS ENUM ('OM', 'VOOO');

-- CreateTable
CREATE TABLE "BreathWorkSession" (
    "id" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "setId" TEXT NOT NULL,

    CONSTRAINT "BreathWorkSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BreathWorkSet" (
    "id" TEXT NOT NULL,
    "type" "BreathWorkType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BreathWorkSet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BreathWorkSession" ADD CONSTRAINT "BreathWorkSession_setId_fkey" FOREIGN KEY ("setId") REFERENCES "BreathWorkSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreathWorkSet" ADD CONSTRAINT "BreathWorkSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
