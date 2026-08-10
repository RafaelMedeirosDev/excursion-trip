import { Injectable } from '@nestjs/common';
import { Reservation, ReservationStatus } from '@prisma/client';
import {
  Create,
  CountActiveByVehicleBookingId,
  FindActiveByEventAndCustomer,
  FindAll,
  FindAllPaginated,
  FindById,
  PaginatedReservations,
  ReservationRepository,
  Reservations,
  UpdateStatus,
} from 'src/domain/ReservationRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

const RESERVATION_SELECT = {
  id: true,
  organizationId: true,
  userId: true,
  customerId: true,
  vehicleBookingId: true,
  boardingPointId: true,
  status: true,
  agreedValue: true,
  canceledAt: true,
  cancelReason: true,
  createdAt: true,
  updatedAt: true,
  customer: {
    select: {
      id: true,
      organizationId: true,
      name: true,
      email: true,
      phone: true,
      cpf: true,
      createdAt: true,
      updatedAt: true,
    },
  },
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
  boardingPoint: {
    select: {
      id: true,
      organizationId: true,
      vehicleBookingId: true,
      address: true,
      time: true,
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
export class PrismaReservationRepository implements ReservationRepository {
  constructor(private readonly repository: PrismaRemoteRepository) {}

  create({
    organizationId,
    userId,
    customerId,
    vehicleBookingId,
    boardingPointId,
    agreedValue,
  }: Create): Promise<Reservation> {
    return this.repository.reservation.create({
      data: {
        organizationId,
        userId,
        customerId,
        vehicleBookingId,
        boardingPointId,
        agreedValue,
      },
    });
  }

  findActiveByEventAndCustomer({
    eventId,
    customerId,
  }: FindActiveByEventAndCustomer): Promise<Reservation | null> {
    return this.repository.reservation.findFirst({
      where: {
        customerId,
        status: { not: ReservationStatus.CANCELED },
        vehicleBooking: { excursion: { eventId } },
      },
    });
  }

  findById({ id }: FindById): Promise<Reservation | null> {
    return this.repository.reservation.findUnique({ where: { id } });
  }

  countActiveByVehicleBookingId({
    vehicleBookingId,
  }: CountActiveByVehicleBookingId): Promise<number> {
    return this.repository.reservation.count({
      where: {
        vehicleBookingId,
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
      },
    });
  }

  findAll({
    organizationId,
    userId,
    status,
    vehicleBookingId,
  }: FindAll): Promise<Reservations[]> {
    return this.repository.reservation.findMany({
      where: {
        organizationId,
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(vehicleBookingId ? { vehicleBookingId } : {}),
        ...(userId && !vehicleBookingId
          ? { OR: [{ userId }, { vehicleBooking: { userId } }] }
          : {}),
      },
      select: RESERVATION_SELECT,
    });
  }

  findAllPaginated({
    organizationId,
    userId,
    status,
    eventName,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedReservations> {
    const where = {
      organizationId,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(eventName
        ? {
            vehicleBooking: {
              excursion: {
                event: { name: { contains: eventName, mode: 'insensitive' as const } },
              },
            },
          }
        : {}),
      ...(userId ? { OR: [{ userId }, { vehicleBooking: { userId } }] } : {}),
    };

    return Promise.all([
      this.repository.reservation.findMany({
        where,
        select: RESERVATION_SELECT,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.repository.reservation.count({ where }),
    ]).then(([data, total]) => ({ data, total, page, limit }));
  }

  updateStatus({
    id,
    status,
    canceledAt,
    cancelReason,
  }: UpdateStatus): Promise<Reservation> {
    return this.repository.reservation.update({
      where: { id },
      data: { status, canceledAt, cancelReason },
    });
  }
}
