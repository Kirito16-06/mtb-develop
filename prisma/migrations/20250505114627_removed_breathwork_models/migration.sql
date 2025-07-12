/*
  Warnings:

  - You are about to drop the `BreathWorkSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BreathWorkSet` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BreathWorkSession" DROP CONSTRAINT "BreathWorkSession_setId_fkey";

-- DropForeignKey
ALTER TABLE "BreathWorkSet" DROP CONSTRAINT "BreathWorkSet_userId_fkey";

-- DropTable
DROP TABLE "BreathWorkSession";

-- DropTable
DROP TABLE "BreathWorkSet";
