-- AlterTable: convert monetary Decimal(10,2) columns to Int (cents), preserving existing values
ALTER TABLE "VehicleBooking" ALTER COLUMN "value" TYPE INTEGER USING ROUND("value" * 100)::integer;
ALTER TABLE "VehicleBooking" ALTER COLUMN "price" TYPE INTEGER USING ROUND("price" * 100)::integer;
ALTER TABLE "Reservation" ALTER COLUMN "agreedValue" TYPE INTEGER USING ROUND("agreedValue" * 100)::integer;
ALTER TABLE "Payment" ALTER COLUMN "value" TYPE INTEGER USING ROUND("value" * 100)::integer;
ALTER TABLE "Expense" ALTER COLUMN "value" TYPE INTEGER USING ROUND("value" * 100)::integer;
