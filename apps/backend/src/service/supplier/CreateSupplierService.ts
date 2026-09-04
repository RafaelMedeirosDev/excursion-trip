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
    const existing = await this.supplierRepository.findByCnpj({
      organizationId,
      cnpj,
    });

    if (existing && !existing.deletedAt) {
      throw new SupplierAlreadyExists();
    }

    // fornecedor excluído com o mesmo CNPJ: é a mesma empresa voltando, então o
    // cadastro restaura a linha antiga (mantendo o histórico de veículos) em
    // vez de barrar com 409 num registro que não aparece em lugar nenhum
    if (existing) {
      return await this.supplierRepository.restore({
        id: existing.id,
        name,
        address,
        phone,
      });
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
