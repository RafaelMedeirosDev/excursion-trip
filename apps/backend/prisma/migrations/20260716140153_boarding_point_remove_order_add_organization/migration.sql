/*
  Warnings:

  - You are about to drop the column `order` on the `BoardingPoint` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `BoardingPoint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BoardingPoint" DROP COLUMN "order",
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "BoardingPoint_organizationId_idx" ON "BoardingPoint"("organizationId");

-- AddForeignKey
ALTER TABLE "BoardingPoint" ADD CONSTRAINT "BoardingPoint_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
