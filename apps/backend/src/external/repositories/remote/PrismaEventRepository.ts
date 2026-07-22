import { Injectable } from '@nestjs/common';
import { Event } from '@prisma/client';
import {
  Create,
  EventRepository,
  Events,
  FindAll,
  FindById,
} from 'src/domain/EventRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

@Injectable()
export class PrismaEventRepository implements EventRepository {
  constructor(private readonly repository: PrismaRemoteRepository) {}

  create({
    organizationId,
    name,
    address,
    city,
    state,
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
        state,
        startDate,
        endDate,
        startTime,
        endTime,
      },
    });
  }

  findById({ id }: FindById): Promise<Event | null> {
    return this.repository.event.findFirst({ where: { id } });
  }

  findAll({ organizationId }: FindAll): Promise<Events[]> {
    return this.repository.event.findMany({
      where: { organizationId, deletedAt: null },
      select: {
        id: true,
        organizationId: true,
        name: true,
        address: true,
        city: true,
        state: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
