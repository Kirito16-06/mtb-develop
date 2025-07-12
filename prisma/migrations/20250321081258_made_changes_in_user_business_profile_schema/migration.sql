/*
  Warnings:

  - You are about to drop the column `isSpotlight` on the `UserBusinessProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserBusinessProfile" DROP COLUMN "isSpotlight",
ADD COLUMN     "featuredWorkDesc" TEXT,
ADD COLUMN     "featuredWorkImage" TEXT,
ADD COLUMN     "featuredWorkTitle" TEXT,
ADD COLUMN     "isSpotlightActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priorityContactLink" TEXT;
