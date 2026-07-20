import { Injectable } from '@nestjs/common';
import { Event } from '@prisma/client';
import { EventRepository } from 'src/domain/EventRepository';
import { EventNotFound } from 'src/shared/erros/cases/EventNotFound';

interface Request {
  organizationId: string;
  id: string;
}

@Injectable()
export class GetEventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute({ organizationId, id }: Request): Promise<Event> {
    const event = await this.eventRepository.findById({ id });

    if (!event || event.organizationId !== organizationId) {
      throw new EventNotFound();
    }

    return event;
  }
}
