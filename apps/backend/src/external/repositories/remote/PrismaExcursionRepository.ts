import { Injectable } from '@nestjs/common';
import { Excursion } from '@prisma/client';
import {
  Create,
  ExcursionRepository,
  Excursions,
  FindAll,
  FindAllPaginated,
  FindById,
  PaginatedExcursions,
  UpdateStatus,
} from 'src/domain/ExcursionRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

@Injectable()
export class PrismaExcursionRepository implements ExcursionRepository {
  constructor(private readonly repository: PrismaRemoteRepository) {}

  create({
    organizationId,
    eventId,
    userId,
    name,
    departureDate,
    returnDate,
  }: Create): Promise<Excursion> {
    return this.repository.excursion.create({
      data: { organizationId, eventId, userId, name, departureDate, returnDate },
    });
  }

  findById({ id }: FindById): Promise<Excursion | null> {
    return this.repository.excursion.findFirst({ where: { id } });
  }

  findAll({ organizationId, status }: FindAll): Promise<Excursions[]> {
    return this.repository.excursion.findMany({
      where: { organizationId, ...(status ? { status } : {}) },
      include: { event: true },
    });
  }

  findAllPaginated({
    organizationId,
    status,
    eventName,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedExcursions> {
    const where = {
      organizationId,
      ...(status ? { status } : {}),
      ...(eventName
        ? { event: { name: { contains: eventName, mode: 'insensitive' as const } } }
        : {}),
    };

    return Promise.all([
      this.repository.excursion.findMany({
        where,
        include: { event: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.repository.excursion.count({ where }),
    ]).then(([data, total]) => ({ data, total, page, limit }));
  }

  updateStatus({
    id,
    status,
    canceledAt,
    cancelReason,
  }: UpdateStatus): Promise<Excursion> {
    return this.repository.excursion.update({
      where: { id },
      data: { status, canceledAt, cancelReason },
    });
  }
}
