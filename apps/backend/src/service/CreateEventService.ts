import { Injectable } from '@nestjs/common';
import { Event, UF } from '@prisma/client';
import { EventRepository } from 'src/domain/EventRepository';
import { EventInvalidDateRange } from 'src/shared/erros/cases/EventInvalidDateRange';

interface Request {
  organizationId: string;
  name: string;
  address: string;
  city: string;
  state: UF;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

@Injectable()
export class CreateEventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute({
    organizationId,
    name,
    address,
    city,
    state,
    startDate,
    endDate,
    startTime,
    endTime,
  }: Request): Promise<Event> {
    if (new Date(endDate) < new Date(startDate)) {
      throw new EventInvalidDateRange();
    }

    return await this.eventRepository.create({
      organizationId,
      name,
      address,
      city,
      state,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
    });
  }
}
