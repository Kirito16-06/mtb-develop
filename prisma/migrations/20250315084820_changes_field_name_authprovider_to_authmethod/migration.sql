/*
  Warnings:

  - You are about to drop the column `authProvider` on the `User` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AuthMethod" AS ENUM ('GOOGLE', 'CREDENTIALS');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "authProvider",
ADD COLUMN     "authMethod" "AuthMethod" NOT NULL DEFAULT 'CREDENTIALS';

-- DropEnum
DROP TYPE "AuthProvider";
