import { Injectable } from '@nestjs/common';
import { Event, UF } from '@prisma/client';
import { EventRepository } from 'src/domain/EventRepository';
import { EventInvalidDateRange } from 'src/shared/erros/cases/EventInvalidDateRange';
import { EventNotFound } from 'src/shared/erros/cases/EventNotFound';

interface Request {
  organizationId: string;
  id: string;
  name?: string;
  address?: string;
  city?: string;
  state?: UF;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

@Injectable()
export class UpdateEventService {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute({
    organizationId,
    id,
    name,
    address,
    city,
    state,
    startDate,
    endDate,
    startTime,
    endTime,
  }: Request): Promise<Event> {
    const event = await this.eventRepository.findById({ id });

    if (!event || event.organizationId !== organizationId) {
      throw new EventNotFound();
    }

    // o intervalo é validado contra os valores finais, não só contra o payload:
    // mandar só endDate anterior ao startDate já guardado tem que falhar
    const nextStartDate = startDate ? new Date(startDate) : event.startDate;
    const nextEndDate = endDate ? new Date(endDate) : event.endDate;

    if (nextEndDate < nextStartDate) {
      throw new EventInvalidDateRange();
    }

    return await this.eventRepository.update({
      id,
      name,
      address,
      city,
      state,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      startTime,
      endTime,
    });
  }
}
