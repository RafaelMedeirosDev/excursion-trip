import {
  BoardingPoint,
  Customer,
  Reservation,
  ReservationStatus,
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

export interface FindActiveByEventAndCustomer {
  eventId: string;
  customerId: string;
}

export interface FindById {
  id: string;
}

export interface FindAll {
  organizationId: string;
  userId?: string;
  status?: ReservationStatus;
}

export type Reservations = Omit<Reservation, 'deletedAt'> & {
  customer: Omit<Customer, 'deletedAt'>;
  vehicleBooking: Omit<VehicleBooking, 'deletedAt'>;
  boardingPoint: Omit<BoardingPoint, 'deletedAt'> | null;
  user: Omit<User, 'password' | 'deletedAt'>;
};

export interface UpdateStatus {
  id: string;
  status: ReservationStatus;
  canceledAt?: Date;
  cancelReason?: string;
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

  abstract findActiveByEventAndCustomer({
    eventId,
    customerId,
  }: FindActiveByEventAndCustomer): Promise<Reservation | null>;

  abstract findById({ id }: FindById): Promise<Reservation | null>;

  abstract findAll({
    organizationId,
    userId,
    status,
  }: FindAll): Promise<Reservations[]>;

  abstract updateStatus({
    id,
    status,
    canceledAt,
    cancelReason,
  }: UpdateStatus): Promise<Reservation>;
}
