import { Injectable } from '@nestjs/common';
import {
  BoardingPointRepository,
  PaginatedBoardingPoints,
} from 'src/domain/BoardingPointRepository';

interface Request {
  organizationId: string;
  address?: string;
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ListPaginatedBoardingPointService {
  constructor(
    private readonly boardingPointRepository: BoardingPointRepository,
  ) {}

  async execute({
    organizationId,
    address,
    page,
    limit,
  }: Request): Promise<PaginatedBoardingPoints> {
    return await this.boardingPointRepository.findAllPaginated({
      organizationId,
      address,
      page: page ?? DEFAULT_PAGE,
      limit: limit ?? DEFAULT_LIMIT,
    });
  }
}
