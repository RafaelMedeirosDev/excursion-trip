import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PaginatedPayments, PaymentRepository } from 'src/domain/PaymentRepository';

interface Request {
  organizationId: string;
  userId: string;
  role: Role;
  query?: string;
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ListPaginatedPaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute({
    organizationId,
    userId,
    role,
    query,
    page,
    limit,
  }: Request): Promise<PaginatedPayments> {
    return await this.paymentRepository.findAllPaginated({
      organizationId,
      userId: role === Role.ADM ? undefined : userId,
      query,
      page: page ?? DEFAULT_PAGE,
      limit: limit ?? DEFAULT_LIMIT,
    });
  }
}
