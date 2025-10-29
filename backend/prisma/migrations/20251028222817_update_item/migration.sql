-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "brand" TEXT,
ADD COLUMN     "condition" TEXT,
ADD COLUMN     "isShared" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "minStock" INTEGER DEFAULT 1,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "serialNumber" TEXT,
ADD COLUMN     "sharedWith" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "unit" TEXT DEFAULT 'pieces',
ADD COLUMN     "visibility" TEXT DEFAULT 'private';
