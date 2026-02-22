-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "designs" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Designs" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Designs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Designs" ADD CONSTRAINT "Designs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
