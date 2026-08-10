import { Injectable } from '@nestjs/common';
import { ExcursionStatus } from '@prisma/client';
import {
  ExcursionRepository,
  PaginatedExcursions,
} from 'src/domain/ExcursionRepository';

interface Request {
  organizationId: string;
  status?: ExcursionStatus;
  eventName?: string;
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ListPaginatedExcursionService {
  constructor(private readonly excursionRepository: ExcursionRepository) {}

  async execute({
    organizationId,
    status,
    eventName,
    page,
    limit,
  }: Request): Promise<PaginatedExcursions> {
    return await this.excursionRepository.findAllPaginated({
      organizationId,
      status,
      eventName,
      page: page ?? DEFAULT_PAGE,
      limit: limit ?? DEFAULT_LIMIT,
    });
  }
}
