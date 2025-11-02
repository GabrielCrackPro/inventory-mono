-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'USER_REGISTERED';
ALTER TYPE "ActivityType" ADD VALUE 'CATEGORY_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'CATEGORY_DELETED';
ALTER TYPE "ActivityType" ADD VALUE 'LOW_STOCK';
ALTER TYPE "ActivityType" ADD VALUE 'STOCK_UPDATED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "preferences" JSONB;
