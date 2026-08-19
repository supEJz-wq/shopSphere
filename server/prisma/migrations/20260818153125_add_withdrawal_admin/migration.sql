-- AlterTable
ALTER TABLE "withdrawals" ADD COLUMN     "adminId" TEXT,
ADD COLUMN     "adminNote" TEXT;

-- CreateIndex
CREATE INDEX "withdrawals_status_idx" ON "withdrawals"("status");

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
