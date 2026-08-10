import { Injectable } from '@nestjs/common';
import {
  CustomerRepository,
  PaginatedCustomers,
} from 'src/domain/CustomerRepository';

interface Request {
  organizationId: string;
  query?: string;
  page: number;
  limit: number;
}

@Injectable()
export class ListPaginatedCustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute({
    organizationId,
    query,
    page,
    limit,
  }: Request): Promise<PaginatedCustomers> {
    return await this.customerRepository.findAllPaginated({
      organizationId,
      query,
      page,
      limit,
    });
  }
}
