-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('ITEM_CREATED', 'ITEM_UPDATED', 'ITEM_DELETED', 'ROOM_CREATED', 'ROOM_UPDATED', 'ROOM_DELETED', 'HOUSE_CREATED', 'HOUSE_UPDATED', 'HOUSE_DELETED', 'USER_LOGIN', 'USER_LOGOUT', 'ROOM_SHARED', 'HOUSE_SHARED', 'CATEGORY_CREATED');

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ActivityType" NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
