import { Injectable } from '@nestjs/common';
import { Customer } from '@prisma/client';
import { CustomerRepository } from 'src/domain/CustomerRepository';
import { CustomerAlreadyExists } from 'src/shared/erros/cases/CustomerAlreadyExists';

interface Request {
  organizationId: string;
  name: string;
  email?: string;
  phone: string;
  cpf: string;
}

@Injectable()
export class CreateCustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute({
    organizationId,
    name,
    email,
    phone,
    cpf,
  }: Request): Promise<Customer> {
    const alreadyExists = await this.customerRepository.findByCpf({
      organizationId,
      cpf,
    });

    if (alreadyExists) {
      throw new CustomerAlreadyExists();
    }

    return await this.customerRepository.create({
      organizationId,
      name,
      email,
      phone,
      cpf,
    });
  }
}
