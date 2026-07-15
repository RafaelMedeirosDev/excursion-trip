import { Injectable } from '@nestjs/common';
import { Supplier } from '@prisma/client';
import {
  Create,
  FindByCnpj,
  FindById,
  SupplierRepository,
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

  findByCnpj({ organizationId, cnpj }: FindByCnpj): Promise<Supplier | null> {
    return this.repository.supplier.findFirst({
      where: { organizationId, cnpj },
    });
  }

  findById({ id }: FindById): Promise<Supplier | null> {
    return this.repository.supplier.findFirst({ where: { id } });
  }
}
