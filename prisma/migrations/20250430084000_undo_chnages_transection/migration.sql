/*
  Warnings:

  - You are about to drop the column `buddyLensRequestId` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_buddyLensRequestId_fkey";

-- DropIndex
DROP INDEX "Transaction_buddyLensRequestId_key";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "buddyLensRequestId";
