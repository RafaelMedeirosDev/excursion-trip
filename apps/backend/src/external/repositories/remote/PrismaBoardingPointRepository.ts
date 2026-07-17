import { Injectable } from '@nestjs/common';
import { BoardingPoint } from '@prisma/client';
import {
  BoardingPointRepository,
  BoardingPoints,
  Create,
  FindAll,
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

  findAll({ organizationId }: FindAll): Promise<BoardingPoints[]> {
    return this.repository.boardingPoint.findMany({
      where: { organizationId, deletedAt: null },
      select: {
        id: true,
        organizationId: true,
        vehicleBookingId: true,
        address: true,
        time: true,
        createdAt: true,
        updatedAt: true,
        vehicleBooking: {
          select: {
            id: true,
            organizationId: true,
            supplierId: true,
            excursionId: true,
            userId: true,
            vehicleType: true,
            plate: true,
            capacity: true,
            value: true,
            startTime: true,
            returnTime: true,
            price: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }
}
