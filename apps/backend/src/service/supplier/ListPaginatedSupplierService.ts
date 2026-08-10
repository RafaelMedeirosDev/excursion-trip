import { Injectable } from '@nestjs/common';
import {
  PaginatedSuppliers,
  SupplierRepository,
} from 'src/domain/SupplierRepository';

interface Request {
  organizationId: string;
  query?: string;
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ListPaginatedSupplierService {
  constructor(private readonly supplierRepository: SupplierRepository) {}

  async execute({
    organizationId,
    query,
    page,
    limit,
  }: Request): Promise<PaginatedSuppliers> {
    return await this.supplierRepository.findAllPaginated({
      organizationId,
      query,
      page: page ?? DEFAULT_PAGE,
      limit: limit ?? DEFAULT_LIMIT,
    });
  }
}
