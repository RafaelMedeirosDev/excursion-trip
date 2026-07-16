import { Injectable } from '@nestjs/common';
import { Payment, PaymentMethod, PaymentType } from '@prisma/client';
import { PaymentRepository } from 'src/domain/PaymentRepository';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { ReservationNotFound } from 'src/shared/erros/cases/ReservationNotFound';

interface Request {
  organizationId: string;
  userId: string;
  reservationId: string;
  type: PaymentType;
  value: number;
  method: PaymentMethod;
}

@Injectable()
export class CreatePaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute({
    organizationId,
    userId,
    reservationId,
    type,
    value,
    method,
  }: Request): Promise<Payment> {
    const reservation = await this.reservationRepository.findById({
      id: reservationId,
    });

    if (!reservation || reservation.organizationId !== organizationId) {
      throw new ReservationNotFound();
    }

    return await this.paymentRepository.create({
      organizationId,
      userId,
      reservationId,
      type,
      value,
      method,
    });
  }
}
