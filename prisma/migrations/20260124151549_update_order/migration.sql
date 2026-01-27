/*
  Warnings:

  - You are about to drop the column `parentOrderId` on the `Order` table. All the data in the column will be lost.
  - Added the required column `service` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `designs` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "parentOrderId",
ADD COLUMN     "service" TEXT NOT NULL,
ALTER COLUMN "quantity" SET DATA TYPE TEXT,
ALTER COLUMN "amount" SET DATA TYPE TEXT,
ALTER COLUMN "orderDate" DROP NOT NULL,
DROP COLUMN "designs",
ADD COLUMN     "designs" JSONB NOT NULL,
ALTER COLUMN "isReorder" DROP NOT NULL;
