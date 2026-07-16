import { Injectable } from '@nestjs/common';
import { Payment } from '@prisma/client';
import { Create, PaymentRepository } from 'src/domain/PaymentRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly repository: PrismaRemoteRepository) {}

  create({
    organizationId,
    userId,
    reservationId,
    type,
    value,
    method,
  }: Create): Promise<Payment> {
    return this.repository.payment.create({
      data: { organizationId, userId, reservationId, type, value, method },
    });
  }
}
