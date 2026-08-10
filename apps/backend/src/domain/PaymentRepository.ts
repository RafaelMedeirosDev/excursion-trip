import {
  Payment,
  PaymentMethod,
  PaymentType,
  Reservation,
  User,
} from '@prisma/client';

export interface Create {
  organizationId: string;
  userId: string;
  reservationId: string;
  type: PaymentType;
  value: number;
  method: PaymentMethod;
}

export interface FindById {
  id: string;
}

export interface FindAll {
  organizationId: string;
  userId?: string;
}

export interface FindAllPaginated {
  organizationId: string;
  userId?: string;
  query?: string;
  page: number;
  limit: number;
}

export interface FindByReservationId {
  reservationId: string;
}

export type Payments = Payment & {
  reservation: Omit<Reservation, 'deletedAt'>;
  user: Omit<User, 'password' | 'deletedAt'>;
};

export interface PaginatedPayments {
  data: Payments[];
  total: number;
  page: number;
  limit: number;
}

export abstract class PaymentRepository {
  abstract create({
    organizationId,
    userId,
    reservationId,
    type,
    value,
    method,
  }: Create): Promise<Payment>;

  abstract findById({ id }: FindById): Promise<Payment | null>;

  abstract findAll({ organizationId, userId }: FindAll): Promise<Payments[]>;

  abstract findAllPaginated({
    organizationId,
    userId,
    query,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedPayments>;

  abstract findByReservationId({
    reservationId,
  }: FindByReservationId): Promise<Payment[]>;
}
