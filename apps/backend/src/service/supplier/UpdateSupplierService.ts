import { Injectable } from '@nestjs/common';
import { Supplier } from '@prisma/client';
import { SupplierRepository } from 'src/domain/SupplierRepository';
import { SupplierAlreadyExists } from 'src/shared/erros/cases/SupplierAlreadyExists';
import { SupplierNotFound } from 'src/shared/erros/cases/SupplierNotFound';

interface Request {
  organizationId: string;
  id: string;
  name?: string;
  cnpj?: string;
  address?: string | null;
  phone?: string;
}

@Injectable()
export class UpdateSupplierService {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute({
    organizationId,
    id,
    name,
    cnpj,
    address,
    phone,
  }: Request): Promise<Supplier> {
    const supplier = await this.supplierRepository.findById({ id });

    if (!supplier || supplier.organizationId !== organizationId) {
      throw new SupplierNotFound();
    }

    if (cnpj && cnpj !== supplier.cnpj) {
      const cnpjOwner = await this.supplierRepository.findByCnpj({
        organizationId,
        cnpj,
      });

      if (cnpjOwner && cnpjOwner.id !== id) {
        throw new SupplierAlreadyExists();
      }
    }

    return await this.supplierRepository.update({
      id,
      name,
      cnpj,
      address,
      phone,
    });
  }
}
