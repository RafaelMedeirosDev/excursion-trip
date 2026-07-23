import { Injectable } from '@nestjs/common';
import { ReservationStatus, Role } from '@prisma/client';
import {
  Reservations,
  ReservationRepository,
} from 'src/domain/ReservationRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { VehicleBookingNotFound } from 'src/shared/erros/cases/VehicleBookingNotFound';

interface Request {
  organizationId: string;
  userId: string;
  role: Role;
  status?: ReservationStatus;
  vehicleBookingId?: string;
}

@Injectable()
export class ListReservationService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly vehicleBookingRepository: VehicleBookingRepository,
  ) {}

  async execute({
    organizationId,
    userId,
    role,
    status,
    vehicleBookingId,
  }: Request): Promise<Reservations[]> {
    if (vehicleBookingId) {
      const vehicleBooking = await this.vehicleBookingRepository.findById({
        id: vehicleBookingId,
      });

      if (
        !vehicleBooking ||
        vehicleBooking.organizationId !== organizationId
      ) {
        throw new VehicleBookingNotFound();
      }

      if (role !== Role.ADM && vehicleBooking.userId !== userId) {
        throw new VehicleBookingNotFound();
      }

      return await this.reservationRepository.findAll({
        organizationId,
        status,
        vehicleBookingId,
      });
    }

    return await this.reservationRepository.findAll({
      organizationId,
      userId: role === Role.ADM ? undefined : userId,
      status,
    });
  }
}
