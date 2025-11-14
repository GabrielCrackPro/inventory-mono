-- CreateTable
CREATE TABLE "HouseInvite" (
    "id" SERIAL NOT NULL,
    "houseId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "inviterId" INTEGER NOT NULL,
    "permission" "PermissionLevel" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HouseInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HouseInvite_tokenHash_key" ON "HouseInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "HouseInvite_houseId_idx" ON "HouseInvite"("houseId");

-- CreateIndex
CREATE INDEX "HouseInvite_email_idx" ON "HouseInvite"("email");

-- CreateIndex
CREATE INDEX "HouseInvite_expiresAt_idx" ON "HouseInvite"("expiresAt");

-- AddForeignKey
ALTER TABLE "HouseInvite" ADD CONSTRAINT "HouseInvite_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HouseInvite" ADD CONSTRAINT "HouseInvite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
