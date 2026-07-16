import { BoardingPoint } from '@prisma/client';

export interface Create {
  organizationId: string;
  vehicleBookingId: string;
  address: string;
  time?: string;
}

export abstract class BoardingPointRepository {
  abstract create({
    organizationId,
    vehicleBookingId,
    address,
    time,
  }: Create): Promise<BoardingPoint>;
}
