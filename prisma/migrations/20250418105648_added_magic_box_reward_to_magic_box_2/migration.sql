/*
  Warnings:

  - The values [MAGIC_BOX] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActivityType_new" AS ENUM ('SIGNUP', 'DAILY_LOGIN', 'QUIZ_CORRECT', 'ADD_LOG', 'SPOTLIGHT', 'PROSPERITY_DROP', 'BUSINESSPROFILE_COMPLETE', 'MIRACLE_LOG', 'PROGRESS_VAULT', 'REFER_BY', 'REFER_TO', 'MAGIC_BOX_REWARD', 'MAGIC_BOX_SHARED_REWARD', 'GENERAL_FEEDBACK', 'FEATURE_REQUEST', 'BUG_REPORT');
ALTER TABLE "Activity" ALTER COLUMN "activity" TYPE "ActivityType_new" USING ("activity"::text::"ActivityType_new");
ALTER TYPE "ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "ActivityType_old";
COMMIT;
