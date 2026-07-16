import { Injectable } from '@nestjs/common';
import { BoardingPoint } from '@prisma/client';
import {
  Create,
  BoardingPointRepository,
  FindById,
} from 'src/domain/BoardingPointRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

@Injectable()
export class PrismaBoardingPointRepository implements BoardingPointRepository {
  constructor(private readonly repository: PrismaRemoteRepository) {}

  create({
    organizationId,
    vehicleBookingId,
    address,
    time,
  }: Create): Promise<BoardingPoint> {
    return this.repository.boardingPoint.create({
      data: { organizationId, vehicleBookingId, address, time },
    });
  }

  findById({ id }: FindById): Promise<BoardingPoint | null> {
    return this.repository.boardingPoint.findUnique({ where: { id } });
  }
}
