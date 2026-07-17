import {
  BoardingPoint,
  Customer,
  Reservation,
  User,
  VehicleBooking,
} from '@prisma/client';

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

export interface FindAll {
  organizationId: string;
  userId?: string;
}

export type Reservations = Omit<Reservation, 'deletedAt'> & {
  customer: Omit<Customer, 'deletedAt'>;
  vehicleBooking: Omit<VehicleBooking, 'deletedAt'>;
  boardingPoint: Omit<BoardingPoint, 'deletedAt'> | null;
  user: Omit<User, 'password' | 'deletedAt'>;
};

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

  abstract findAll({ organizationId, userId }: FindAll): Promise<Reservations[]>;
}
