import { Injectable } from '@nestjs/common';
import { Customer } from '@prisma/client';
import {
  Create,
  CustomerRepository,
  Customers,
  FindAll,
  FindByCpf,
  FindById,
} from 'src/domain/CustomerRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

@Injectable()
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly repository: PrismaRemoteRepository) {}

  create({ organizationId, name, email, phone, cpf }: Create): Promise<Customer> {
    return this.repository.customer.create({
      data: { organizationId, name, email, phone, cpf },
    });
  }

  findByCpf({ organizationId, cpf }: FindByCpf): Promise<Customer | null> {
    return this.repository.customer.findFirst({
      where: { organizationId, cpf },
    });
  }

  findById({ id }: FindById): Promise<Customer | null> {
    return this.repository.customer.findUnique({ where: { id } });
  }

  findAll({ organizationId }: FindAll): Promise<Customers[]> {
    return this.repository.customer.findMany({
      where: { organizationId, deletedAt: null },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
