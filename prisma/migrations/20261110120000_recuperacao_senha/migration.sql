-- AlterTable
ALTER TABLE "Admin" ADD COLUMN IF NOT EXISTS "emailRecuperacao" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "SenhaResetToken" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SenhaResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SenhaResetToken_tokenHash_key" ON "SenhaResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SenhaResetToken_adminId_idx" ON "SenhaResetToken"("adminId");

-- AddForeignKey
ALTER TABLE "SenhaResetToken" ADD CONSTRAINT "SenhaResetToken_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
