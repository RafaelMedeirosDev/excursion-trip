import { Injectable } from '@nestjs/common';
import { Event } from '@prisma/client';
import { Create, EventRepository } from 'src/domain/EventRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

@Injectable()
export class PrismaEventRepository implements EventRepository {
  constructor(private readonly repository: PrismaRemoteRepository) {}

  create({
    organizationId,
    name,
    address,
    city,
    startDate,
    endDate,
    startTime,
    endTime,
  }: Create): Promise<Event> {
    return this.repository.event.create({
      data: {
        organizationId,
        name,
        address,
        city,
        startDate,
        endDate,
        startTime,
        endTime,
      },
    });
  }
}
