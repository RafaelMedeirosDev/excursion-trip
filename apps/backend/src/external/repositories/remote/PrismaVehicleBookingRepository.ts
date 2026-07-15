import { Injectable } from '@nestjs/common';
import { VehicleBooking } from '@prisma/client';
import {
  Create,
  FindByExcursionAndPlate,
  VehicleBookingRepository,
} from 'src/domain/VehicleBookingRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

@Injectable()
export class PrismaVehicleBookingRepository
  implements VehicleBookingRepository
{
  constructor(private readonly repository: PrismaRemoteRepository) {}

  create({
    organizationId,
    supplierId,
    excursionId,
    userId,
    vehicleType,
    plate,
    capacity,
    value,
    startTime,
    returnTime,
    price,
  }: Create): Promise<VehicleBooking> {
    return this.repository.vehicleBooking.create({
      data: {
        organizationId,
        supplierId,
        excursionId,
        userId,
        vehicleType,
        plate,
        capacity,
        value,
        startTime,
        returnTime,
        price,
      },
    });
  }

  findByExcursionAndPlate({
    excursionId,
    plate,
  }: FindByExcursionAndPlate): Promise<VehicleBooking | null> {
    return this.repository.vehicleBooking.findFirst({
      where: { excursionId, plate },
    });
  }
}
