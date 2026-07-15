import { Injectable } from '@nestjs/common';
import { Supplier } from '@prisma/client';
import { SupplierRepository } from 'src/domain/SupplierRepository';
import { SupplierAlreadyExists } from 'src/shared/erros/cases/SupplierAlreadyExists';

interface Request {
  organizationId: string;
  name: string;
  cnpj: string;
  address?: string;
  phone: string;
}

@Injectable()
export class CreateSupplierService {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute({
    organizationId,
    name,
    cnpj,
    address,
    phone,
  }: Request): Promise<Supplier> {
    const alreadyExists = await this.supplierRepository.findByCnpj({
      organizationId,
      cnpj,
    });

    if (alreadyExists) {
      throw new SupplierAlreadyExists();
    }

    return await this.supplierRepository.create({
      organizationId,
      name,
      cnpj,
      address,
      phone,
    });
  }
}
