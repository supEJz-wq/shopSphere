-- AlterTable
ALTER TABLE "seller_applications" ADD COLUMN     "idNumber" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "idType" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "phoneNumber" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "secondIdNumber" TEXT,
ADD COLUMN     "secondIdType" TEXT;