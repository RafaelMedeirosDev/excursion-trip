import { Reservation } from '@prisma/client';

export interface Create {
  organizationId: string;
  userId: string;
  customerId: string;
  vehicleBookingId: string;
  boardingPointId?: string;
  agreedValue: number;
}

export interface FindByVehicleBookingAndCustomer {
  vehicleBookingId: string;
  customerId: string;
}

export interface FindById {
  id: string;
}

export abstract class ReservationRepository {
  abstract create({
    organizationId,
    userId,
    customerId,
    vehicleBookingId,
    boardingPointId,
    agreedValue,
  }: Create): Promise<Reservation>;

  abstract findByVehicleBookingAndCustomer({
    vehicleBookingId,
    customerId,
  }: FindByVehicleBookingAndCustomer): Promise<Reservation | null>;

  abstract findById({ id }: FindById): Promise<Reservation | null>;
}
