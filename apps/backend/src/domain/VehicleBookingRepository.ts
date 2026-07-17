import { Excursion, Supplier, User, VehicleBooking } from '@prisma/client';

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

export interface FindById {
  id: string;
}

export interface FindAll {
  organizationId: string;
}

export type VehicleBookings = Omit<VehicleBooking, 'deletedAt'> & {
  excursion: Excursion;
  supplier: Omit<Supplier, 'deletedAt'>;
  user: Omit<User, 'password' | 'deletedAt'>;
};

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

  abstract findById({ id }: FindById): Promise<VehicleBooking | null>;

  abstract findAll({ organizationId }: FindAll): Promise<VehicleBookings[]>;
}
