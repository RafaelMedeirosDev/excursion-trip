import { Injectable } from '@nestjs/common';
import { Reservation } from '@prisma/client';
import {
  Create,
  FindAll,
  FindByVehicleBookingAndCustomer,
  FindById,
  ReservationRepository,
  Reservations,
} from 'src/domain/ReservationRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

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

  findByVehicleBookingAndCustomer({
    vehicleBookingId,
    customerId,
  }: FindByVehicleBookingAndCustomer): Promise<Reservation | null> {
    return this.repository.reservation.findFirst({
      where: { vehicleBookingId, customerId },
    });
  }

  findById({ id }: FindById): Promise<Reservation | null> {
    return this.repository.reservation.findUnique({ where: { id } });
  }

  findAll({ organizationId, userId }: FindAll): Promise<Reservations[]> {
    return this.repository.reservation.findMany({
      where: {
        organizationId,
        deletedAt: null,
        ...(userId ? { userId } : {}),
      },
      select: {
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
      },
    });
  }
}
