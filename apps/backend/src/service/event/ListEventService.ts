import { Injectable } from '@nestjs/common';
import { EventRepository, Events } from 'src/domain/EventRepository';

interface Request {
  organizationId: string;
}

@Injectable()
export class ListEventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute({ organizationId }: Request): Promise<Events[]> {
    return await this.eventRepository.findAll({ organizationId });
  }
}
