import { Injectable } from '@nestjs/common';
import { Event } from '@prisma/client';
import { EventRepository } from 'src/domain/EventRepository';

interface Request {
  organizationId: string;
  name: string;
  address: string;
  city: string;
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
    startDate,
    endDate,
    startTime,
    endTime,
  }: Request): Promise<Event> {
    return await this.eventRepository.create({
      organizationId,
      name,
      address,
      city,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
    });
  }
}
