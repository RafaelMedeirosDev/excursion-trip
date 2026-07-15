import { VehicleBooking } from '@prisma/client';

export interface Create {
  organizationId: string;
  supplierId: string;
  excursionId: string;
  userId: string;
  vehicleType: string;
  plate?: string;
  capacity: number;
  value: number;
  startTime?: string;
  returnTime?: string;
  price: number;
}

export interface FindByExcursionAndPlate {
  excursionId: string;
  plate: string;
}

export abstract class VehicleBookingRepository {
  abstract create({
    organizationId,
    supplierId,
    excursionId,
    userId,
    vehicleType,
    plate,
    capacity,
    value,
    startTime,
    returnTime,
    price,
  }: Create): Promise<VehicleBooking>;

  abstract findByExcursionAndPlate({
    excursionId,
    plate,
  }: FindByExcursionAndPlate): Promise<VehicleBooking | null>;
}
