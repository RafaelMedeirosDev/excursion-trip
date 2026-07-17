import { Injectable } from '@nestjs/common';
import { CustomerRepository, Customers } from 'src/domain/CustomerRepository';

interface Request {
  organizationId: string;
}

@Injectable()
export class ListCustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute({ organizationId }: Request): Promise<Customers[]> {
    return await this.customerRepository.findAll({ organizationId });
  }
}
