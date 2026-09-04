import { Injectable } from '@nestjs/common';
import { Customer } from '@prisma/client';
import {
  Create,
  CustomerRepository,
  Customers,
  FindAll,
  FindAllPaginated,
  FindByCpf,
  FindById,
  PaginatedCustomers,
  Update,
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

  update({ id, name, email, phone, cpf }: Update): Promise<Customer> {
    return this.repository.customer.update({
      where: { id },
      data: { name, email, phone, cpf },
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

  findAllPaginated({
    organizationId,
    query,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedCustomers> {
    const where = {
      organizationId,
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' as const } },
              { cpf: { contains: query } },
            ],
          }
        : {}),
    };

    return Promise.all([
      this.repository.customer.findMany({
        where,
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.repository.customer.count({ where }),
    ]).then(([data, total]) => ({ data, total, page, limit }));
  }
}
