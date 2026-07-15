/*
  Warnings:

  - You are about to drop the column `price` on the `Excursion` table. All the data in the column will be lost.
  - You are about to drop the column `returnTime` on the `Excursion` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Excursion` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `Excursion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Excursion" DROP COLUMN "price",
DROP COLUMN "returnTime",
DROP COLUMN "startTime",
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Excursion_organizationId_idx" ON "Excursion"("organizationId");

-- AddForeignKey
ALTER TABLE "Excursion" ADD CONSTRAINT "Excursion_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
