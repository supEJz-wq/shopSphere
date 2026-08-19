-- CreateTable
CREATE TABLE "warning_replies" (
    "id" TEXT NOT NULL,
    "warningId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warning_replies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "warning_replies" ADD CONSTRAINT "warning_replies_warningId_fkey" FOREIGN KEY ("warningId") REFERENCES "seller_warnings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warning_replies" ADD CONSTRAINT "warning_replies_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
