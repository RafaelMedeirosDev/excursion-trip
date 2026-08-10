import { Injectable } from '@nestjs/common';
import { Event } from '@prisma/client';
import {
  Create,
  EventRepository,
  Events,
  FindAll,
  FindAllPaginated,
  FindById,
  PaginatedEvents,
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

  findAllPaginated({
    organizationId,
    name,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedEvents> {
    const where = {
      organizationId,
      deletedAt: null,
      ...(name ? { name: { contains: name, mode: 'insensitive' as const } } : {}),
    };

    return Promise.all([
      this.repository.event.findMany({
        where,
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.repository.event.count({ where }),
    ]).then(([data, total]) => ({ data, total, page, limit }));
  }
}
