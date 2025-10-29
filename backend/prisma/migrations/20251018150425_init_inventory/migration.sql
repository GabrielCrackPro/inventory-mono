/*
  Warnings:

  - The values [KITCHEN,LIVING_ROOM,BEDROOM,BATHROOM,STORAGE,OTHER] on the enum `RoomType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `condition` on the `Item` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoomType_new" AS ENUM ('PUBLIC', 'PRIVATE');
ALTER TABLE "Room" ALTER COLUMN "type" TYPE "RoomType_new" USING ("type"::text::"RoomType_new");
ALTER TYPE "RoomType" RENAME TO "RoomType_old";
ALTER TYPE "RoomType_new" RENAME TO "RoomType";
DROP TYPE "public"."RoomType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "condition";

-- DropEnum
DROP TYPE "public"."ItemCondition";
