-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


-- ALTER TYPE "ActivityType" ADD VALUE 'BUDDY_LENS_REQUEST';
-- ALTER TYPE "ActivityType" ADD VALUE 'BUDDY_LENS_REVIEW';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'BUDDY_LENS_CLAIMED';
ALTER TYPE "NotificationType" ADD VALUE 'BUDDY_LENS_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE 'BUDDY_LENS_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'BUDDY_LENS_REVIEWED';
ALTER TYPE "NotificationType" ADD VALUE 'BUDDY_LENS_COMPLETED';
