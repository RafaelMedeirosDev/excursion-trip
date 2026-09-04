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
    const existing = await this.customerRepository.findByCpf({
      organizationId,
      cpf,
    });

    if (existing && !existing.deletedAt) {
      throw new CustomerAlreadyExists();
    }

    // passageiro excluído com o mesmo CPF: é a mesma pessoa voltando, então o
    // cadastro restaura a linha antiga (mantendo o histórico de reservas) em
    // vez de barrar com 409 num registro que não aparece em lugar nenhum
    if (existing) {
      return await this.customerRepository.restore({
        id: existing.id,
        name,
        email,
        phone,
      });
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
