import { Injectable } from '@nestjs/common';
import { Supplier } from '@prisma/client';
import {
  Create,
  FindAll,
  FindAllPaginated,
  FindByCnpj,
  FindById,
  PaginatedSuppliers,
  Update,
  SupplierRepository,
  Suppliers,
} from 'src/domain/SupplierRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

@Injectable()
export class PrismaSupplierRepository implements SupplierRepository {
  constructor(private readonly repository: PrismaRemoteRepository) {}

  create({ organizationId, name, cnpj, address, phone }: Create): Promise<Supplier> {
    return this.repository.supplier.create({
      data: { organizationId, name, cnpj, address, phone },
    });
  }

  update({ id, name, cnpj, address, phone }: Update): Promise<Supplier> {
    return this.repository.supplier.update({
      where: { id },
      data: { name, cnpj, address, phone },
    });
  }

  findByCnpj({ organizationId, cnpj }: FindByCnpj): Promise<Supplier | null> {
    return this.repository.supplier.findFirst({
      where: { organizationId, cnpj },
    });
  }

  findById({ id }: FindById): Promise<Supplier | null> {
    return this.repository.supplier.findFirst({ where: { id } });
  }

  findAll({ organizationId }: FindAll): Promise<Suppliers[]> {
    return this.repository.supplier.findMany({
      where: { organizationId, deletedAt: null },
      select: {
        id: true,
        organizationId: true,
        name: true,
        cnpj: true,
        address: true,
        phone: true,
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
  }: FindAllPaginated): Promise<PaginatedSuppliers> {
    const where = {
      organizationId,
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' as const } },
              { cnpj: { contains: query } },
              { phone: { contains: query } },
            ],
          }
        : {}),
    };

    return Promise.all([
      this.repository.supplier.findMany({
        where,
        select: {
          id: true,
          organizationId: true,
          name: true,
          cnpj: true,
          address: true,
          phone: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.repository.supplier.count({ where }),
    ]).then(([data, total]) => ({ data, total, page, limit }));
  }
}
