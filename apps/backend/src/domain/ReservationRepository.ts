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

export interface CountActiveByVehicleBookingId {
  vehicleBookingId: string;
}

export interface FindAll {
  organizationId: string;
  userId?: string;
  status?: ReservationStatus;
  vehicleBookingId?: string;
}

export interface FindAllPaginated {
  organizationId: string;
  userId?: string;
  status?: ReservationStatus;
  eventName?: string;
  page: number;
  limit: number;
}

export type Reservations = Omit<Reservation, 'deletedAt'> & {
  customer: Omit<Customer, 'deletedAt'>;
  vehicleBooking: Omit<VehicleBooking, 'deletedAt'>;
  boardingPoint: Omit<BoardingPoint, 'deletedAt'> | null;
  user: Omit<User, 'password' | 'deletedAt'>;
};

export interface PaginatedReservations {
  data: Reservations[];
  total: number;
  page: number;
  limit: number;
}

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

  abstract countActiveByVehicleBookingId({
    vehicleBookingId,
  }: CountActiveByVehicleBookingId): Promise<number>;

  abstract findAll({
    organizationId,
    userId,
    status,
    vehicleBookingId,
  }: FindAll): Promise<Reservations[]>;

  abstract findAllPaginated({
    organizationId,
    userId,
    status,
    eventName,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedReservations>;

  abstract updateStatus({
    id,
    status,
    canceledAt,
    cancelReason,
  }: UpdateStatus): Promise<Reservation>;
}
