/*
  Warnings:

  - You are about to drop the column `excursionId` on the `Reservation` table. All the data in the column will be lost.
  - Made the column `vehicleBookingId` on table `Reservation` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `organizationId` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - A unique constraint covering the columns `[vehicleBookingId,customerId]` on the table `Reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_excursionId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_vehicleBookingId_fkey";

-- DropIndex
DROP INDEX "Reservation_excursionId_idx";

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "excursionId",
ADD COLUMN     "organizationId" TEXT NOT NULL,
ALTER COLUMN "vehicleBookingId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Reservation_organizationId_idx" ON "Reservation"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_vehicleBookingId_customerId_key" ON "Reservation"("vehicleBookingId", "customerId");

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_vehicleBookingId_fkey" FOREIGN KEY ("vehicleBookingId") REFERENCES "VehicleBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
