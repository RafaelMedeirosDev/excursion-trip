import { Injectable } from '@nestjs/common';
import { Reservation } from '@prisma/client';
import {
  Create,
  FindByVehicleBookingAndCustomer,
  FindById,
  ReservationRepository,
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
}
