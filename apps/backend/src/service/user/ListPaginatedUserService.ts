import { Injectable } from '@nestjs/common';
import { PaginatedUsers, UserRepository } from 'src/domain/UserRepository';

interface Request {
  organizationId: string;
  query?: string;
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ListPaginatedUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    organizationId,
    query,
    page,
    limit,
  }: Request): Promise<PaginatedUsers> {
    return await this.userRepository.findAllPaginated({
      organizationId,
      query,
      page: page ?? DEFAULT_PAGE,
      limit: limit ?? DEFAULT_LIMIT,
    });
  }
}
