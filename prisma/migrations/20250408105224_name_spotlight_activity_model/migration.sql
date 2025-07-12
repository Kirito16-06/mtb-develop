-- CreateEnum
CREATE TYPE "SpotlightActivityType" AS ENUM ('VIEW', 'CONNECT');

-- CreateTable
CREATE TABLE "SpotlightActivity" (
    "id" TEXT NOT NULL,
    "type" "SpotlightActivityType" NOT NULL,
    "spotlightId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpotlightActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SpotlightActivity_spotlightId_idx" ON "SpotlightActivity"("spotlightId");

-- CreateIndex
CREATE INDEX "SpotlightActivity_createdAt_idx" ON "SpotlightActivity"("createdAt");

-- AddForeignKey
ALTER TABLE "SpotlightActivity" ADD CONSTRAINT "SpotlightActivity_spotlightId_fkey" FOREIGN KEY ("spotlightId") REFERENCES "Spotlight"("id") ON DELETE CASCADE ON UPDATE CASCADE;
