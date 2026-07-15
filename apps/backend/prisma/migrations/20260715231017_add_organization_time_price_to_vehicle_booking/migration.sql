/*
  Warnings:

  - Added the required column `organizationId` to the `VehicleBooking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `VehicleBooking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VehicleBooking" ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "returnTime" TEXT,
ADD COLUMN     "startTime" TEXT;

-- CreateIndex
CREATE INDEX "VehicleBooking_organizationId_idx" ON "VehicleBooking"("organizationId");

-- AddForeignKey
ALTER TABLE "VehicleBooking" ADD CONSTRAINT "VehicleBooking_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
