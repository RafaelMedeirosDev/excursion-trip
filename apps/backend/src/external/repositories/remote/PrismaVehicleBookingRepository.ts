import { Injectable } from '@nestjs/common';
import { ExcursionStatus, VehicleBooking } from '@prisma/client';
import {
  CountUpcomingBySupplierId,
  Create,
  FindAll,
  FindAllPaginated,
  FindByExcursionAndPlate,
  FindById,
  PaginatedVehicleBookings,
  VehicleBookingRepository,
  VehicleBookings,
} from 'src/domain/VehicleBookingRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

const VEHICLE_BOOKING_SELECT = {
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
} as const;

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

  // "upcoming" = veículo ativo em excursão que ainda não terminou. Contar
  // qualquer veículo tornaria todo fornecedor já usado uma vez não-excluível.
  countUpcomingBySupplierId({
    supplierId,
  }: CountUpcomingBySupplierId): Promise<number> {
    return this.repository.vehicleBooking.count({
      where: {
        supplierId,
        deletedAt: null,
        excursion: {
          status: {
            notIn: [ExcursionStatus.DONE, ExcursionStatus.CANCELED],
          },
        },
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
      select: VEHICLE_BOOKING_SELECT,
    });
  }

  findAllPaginated({
    organizationId,
    userId,
    query,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedVehicleBookings> {
    const where = {
      organizationId,
      deletedAt: null,
      ...(userId ? { userId } : {}),
      ...(query
        ? {
            OR: [
              {
                excursion: {
                  event: { name: { contains: query, mode: 'insensitive' as const } },
                },
              },
              { user: { name: { contains: query, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };

    return Promise.all([
      this.repository.vehicleBooking.findMany({
        where,
        select: VEHICLE_BOOKING_SELECT,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.repository.vehicleBooking.count({ where }),
    ]).then(([data, total]) => ({ data, total, page, limit }));
  }
}
