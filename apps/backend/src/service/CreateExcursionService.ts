import { Injectable } from '@nestjs/common';
import { Excursion } from '@prisma/client';
import { EventRepository } from 'src/domain/EventRepository';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { EventNotFound } from 'src/shared/erros/cases/EventNotFound';

interface Request {
  organizationId: string;
  userId: string;
  eventId: string;
  name: string;
  departureDate: string;
  returnDate: string;
}

@Injectable()
export class CreateExcursionService {
  constructor(
    private readonly excursionRepository: ExcursionRepository,
    private readonly eventRepository: EventRepository,
  ) {}

  async execute({
    organizationId,
    userId,
    eventId,
    name,
    departureDate,
    returnDate,
  }: Request): Promise<Excursion> {
    const event = await this.eventRepository.findById({ id: eventId });

    if (!event || event.organizationId !== organizationId) {
      throw new EventNotFound();
    }

    return await this.excursionRepository.create({
      organizationId,
      eventId,
      userId,
      name,
      departureDate: new Date(departureDate),
      returnDate: new Date(returnDate),
    });
  }
}
