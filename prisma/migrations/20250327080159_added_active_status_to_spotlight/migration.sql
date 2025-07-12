/*
  Warnings:

  - You are about to drop the column `isActive` on the `Spotlight` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "SpotlightStatus" ADD VALUE 'ACTIVE';

-- AlterTable
ALTER TABLE "Spotlight" DROP COLUMN "isActive";
