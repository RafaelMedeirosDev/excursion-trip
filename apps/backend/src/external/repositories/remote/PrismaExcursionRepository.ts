import { Injectable } from '@nestjs/common';
import { Excursion } from '@prisma/client';
import {
  Create,
  ExcursionRepository,
  Excursions,
  FindAll,
  FindById,
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

  findAll({ organizationId }: FindAll): Promise<Excursions[]> {
    return this.repository.excursion.findMany({
      where: { organizationId },
      include: { event: true },
    });
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
