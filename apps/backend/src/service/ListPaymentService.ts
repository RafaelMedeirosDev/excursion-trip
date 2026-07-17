import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PaymentRepository, Payments } from 'src/domain/PaymentRepository';

interface Request {
  organizationId: string;
  userId: string;
  role: Role;
}

@Injectable()
export class ListPaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute({ organizationId, userId, role }: Request): Promise<Payments[]> {
    return await this.paymentRepository.findAll({
      organizationId,
      userId: role === Role.ADM ? undefined : userId,
    });
  }
}
