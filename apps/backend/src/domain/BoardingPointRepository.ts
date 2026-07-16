import { BoardingPoint } from '@prisma/client';

export interface Create {
  organizationId: string;
  vehicleBookingId: string;
  address: string;
  time?: string;
}

export interface FindById {
  id: string;
}

export abstract class BoardingPointRepository {
  abstract create({
    organizationId,
    vehicleBookingId,
    address,
    time,
  }: Create): Promise<BoardingPoint>;

  abstract findById({ id }: FindById): Promise<BoardingPoint | null>;
}
