import { Payment, PaymentMethod, PaymentType } from '@prisma/client';

export interface Create {
  organizationId: string;
  userId: string;
  reservationId: string;
  type: PaymentType;
  value: number;
  method: PaymentMethod;
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
}
