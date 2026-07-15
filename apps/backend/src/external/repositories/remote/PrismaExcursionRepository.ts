import { Injectable } from '@nestjs/common';
import { Excursion } from '@prisma/client';
import {
  Create,
  ExcursionRepository,
  FindById,
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
}
