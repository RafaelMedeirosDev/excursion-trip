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

export interface FindAll {
  organizationId: string;
  userId?: string;
}

export interface FindByReservationId {
  reservationId: string;
}

export type Payments = Payment & {
  reservation: Omit<Reservation, 'deletedAt'>;
  user: Omit<User, 'password' | 'deletedAt'>;
};

export abstract class PaymentRepository {
  abstract create({
    organizationId,
    userId,
    reservationId,
    type,
    value,
    method,
  }: Create): Promise<Payment>;

  abstract findAll({ organizationId, userId }: FindAll): Promise<Payments[]>;

  abstract findByReservationId({
    reservationId,
  }: FindByReservationId): Promise<Payment[]>;
}
