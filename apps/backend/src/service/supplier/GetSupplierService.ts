import { Injectable } from '@nestjs/common';
import { Supplier } from '@prisma/client';
import { SupplierRepository } from 'src/domain/SupplierRepository';
import { SupplierNotFound } from 'src/shared/erros/cases/SupplierNotFound';

interface Request {
  organizationId: string;
  id: string;
}

@Injectable()
export class GetSupplierService {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute({ organizationId, id }: Request): Promise<Supplier> {
    const supplier = await this.supplierRepository.findById({ id });

    if (!supplier || supplier.organizationId !== organizationId) {
      throw new SupplierNotFound();
    }

    return supplier;
  }
}
