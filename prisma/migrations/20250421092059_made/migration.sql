/*
  Warnings:

  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - Made the column `jpAmount` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "jpAmount" SET NOT NULL;

-- AlterTable
-- ALTER TABLE "User" DROP COLUMN "address",
-- DROP COLUMN "phone";
