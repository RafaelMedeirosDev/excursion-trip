import { Injectable } from '@nestjs/common';
import { Customer } from '@prisma/client';
import { CustomerRepository } from 'src/domain/CustomerRepository';
import { CustomerAlreadyExists } from 'src/shared/erros/cases/CustomerAlreadyExists';
import { CustomerNotFound } from 'src/shared/erros/cases/CustomerNotFound';

interface Request {
  organizationId: string;
  id: string;
  name?: string;
  email?: string | null;
  phone?: string;
  cpf?: string;
}

@Injectable()
export class UpdateCustomerService {
  constructor(private readonly customerRepository: CustomerRepository) {}

  async execute({
    organizationId,
    id,
    name,
    email,
    phone,
    cpf,
  }: Request): Promise<Customer> {
    const customer = await this.customerRepository.findById({ id });

    if (!customer || customer.organizationId !== organizationId) {
      throw new CustomerNotFound();
    }

    if (cpf && cpf !== customer.cpf) {
      const cpfOwner = await this.customerRepository.findByCpf({
        organizationId,
        cpf,
      });

      if (cpfOwner && cpfOwner.id !== id) {
        throw new CustomerAlreadyExists();
      }
    }

    return await this.customerRepository.update({
      id,
      name,
      email,
      phone,
      cpf,
    });
  }
}
