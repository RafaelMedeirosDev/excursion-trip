import { Injectable } from '@nestjs/common';
import { SupplierRepository, Suppliers } from 'src/domain/SupplierRepository';

interface Request {
  organizationId: string;
}

@Injectable()
export class ListSupplierService {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute({ organizationId }: Request): Promise<Suppliers[]> {
    return await this.supplierRepository.findAll({ organizationId });
  }
}
