import { Injectable } from '@nestjs/common';
import { EventRepository, PaginatedEvents } from 'src/domain/EventRepository';

interface Request {
  organizationId: string;
  name?: string;
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ListPaginatedEventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute({
    organizationId,
    name,
    page,
    limit,
  }: Request): Promise<PaginatedEvents> {
    return await this.eventRepository.findAllPaginated({
      organizationId,
      name,
      page: page ?? DEFAULT_PAGE,
      limit: limit ?? DEFAULT_LIMIT,
    });
  }
}
