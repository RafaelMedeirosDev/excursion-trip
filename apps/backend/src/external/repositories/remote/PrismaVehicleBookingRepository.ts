import { Injectable } from '@nestjs/common';
import { VehicleBooking } from '@prisma/client';
import {
  Create,
  FindAll,
  FindByExcursionAndPlate,
  FindById,
  VehicleBookingRepository,
  VehicleBookings,
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

  findById({ id }: FindById): Promise<VehicleBooking | null> {
    return this.repository.vehicleBooking.findFirst({ where: { id } });
  }

  findAll({ organizationId, userId }: FindAll): Promise<VehicleBookings[]> {
    return this.repository.vehicleBooking.findMany({
      where: {
        organizationId,
        deletedAt: null,
        ...(userId ? { userId } : {}),
      },
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
        excursion: true,
        supplier: {
          select: {
            id: true,
            organizationId: true,
            name: true,
            cnpj: true,
            address: true,
            phone: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        user: {
          select: {
            id: true,
            organizationId: true,
            name: true,
            email: true,
            phone: true,
            cpf: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }
}
