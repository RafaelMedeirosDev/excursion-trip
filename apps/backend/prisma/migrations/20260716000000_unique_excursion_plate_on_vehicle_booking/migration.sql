-- CreateIndex
CREATE UNIQUE INDEX "VehicleBooking_excursionId_plate_key" ON "VehicleBooking"("excursionId", "plate");
