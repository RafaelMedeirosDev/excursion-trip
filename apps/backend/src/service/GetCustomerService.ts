import { Injectable } from '@nestjs/common';
import { Customer } from '@prisma/client';
import { CustomerRepository } from 'src/domain/CustomerRepository';
import { CustomerNotFound } from 'src/shared/erros/cases/CustomerNotFound';

interface Request {
  organizationId: string;
  id: string;
}

@Injectable()
export class GetCustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute({ organizationId, id }: Request): Promise<Customer> {
    const customer = await this.customerRepository.findById({ id });

    if (!customer || customer.organizationId !== organizationId) {
      throw new CustomerNotFound();
    }

    return customer;
  }
}
