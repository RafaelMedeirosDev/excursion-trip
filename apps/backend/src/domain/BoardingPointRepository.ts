import { BoardingPoint, VehicleBooking } from '@prisma/client';

export interface Create {
  organizationId: string;
  vehicleBookingId: string;
  address: string;
  time?: string;
}

export interface FindById {
  id: string;
}

export interface FindAll {
  organizationId: string;
}

export type BoardingPoints = Omit<BoardingPoint, 'deletedAt'> & {
  vehicleBooking: Omit<VehicleBooking, 'deletedAt'>;
};

export abstract class BoardingPointRepository {
  abstract create({
    organizationId,
    vehicleBookingId,
    address,
    time,
  }: Create): Promise<BoardingPoint>;

  abstract findById({ id }: FindById): Promise<BoardingPoint | null>;

  abstract findAll({ organizationId }: FindAll): Promise<BoardingPoints[]>;
}
