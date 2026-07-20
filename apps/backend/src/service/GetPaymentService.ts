import { Injectable } from '@nestjs/common';
import { Payment, Role } from '@prisma/client';
import { PaymentRepository } from 'src/domain/PaymentRepository';
import { PaymentNotFound } from 'src/shared/erros/cases/PaymentNotFound';

interface Request {
  organizationId: string;
  id: string;
  userId: string;
  role: Role;
}

@Injectable()
export class GetPaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute({
    organizationId,
    id,
    userId,
    role,
  }: Request): Promise<Payment> {
    const payment = await this.paymentRepository.findById({ id });

    if (!payment || payment.organizationId !== organizationId) {
      throw new PaymentNotFound();
    }

    if (role !== Role.ADM && payment.userId !== userId) {
      throw new PaymentNotFound();
    }

    return payment;
  }
}
