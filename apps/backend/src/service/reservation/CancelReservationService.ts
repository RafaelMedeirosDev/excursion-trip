import { Injectable } from '@nestjs/common';
import {
  ExcursionStatus,
  Reservation,
  ReservationStatus,
  Role,
} from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { InvalidReservationStatusTransition } from 'src/shared/erros/cases/InvalidReservationStatusTransition';
import { ReservationExcursionNotAvailableForStatusChange } from 'src/shared/erros/cases/ReservationExcursionNotAvailableForStatusChange';
import { ReservationNotFound } from 'src/shared/erros/cases/ReservationNotFound';

interface Request {
  organizationId: string;
  userId: string;
  role: Role;
  id: string;
  cancelReason: string;
}

const BLOCKED_EXCURSION_STATUSES: ExcursionStatus[] = [
  ExcursionStatus.DONE,
  ExcursionStatus.CANCELED,
];

@Injectable()
export class CancelReservationService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly vehicleBookingRepository: VehicleBookingRepository,
    private readonly excursionRepository: ExcursionRepository,
  ) {}

  async execute({
    organizationId,
    userId,
    role,
    id,
    cancelReason,
  }: Request): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById({ id });

    if (!reservation || reservation.organizationId !== organizationId) {
      throw new ReservationNotFound();
    }

    const vehicleBooking = await this.vehicleBookingRepository.findById({
      id: reservation.vehicleBookingId,
    });

    if (
      role !== Role.ADM &&
      reservation.userId !== userId &&
      vehicleBooking?.userId !== userId
    ) {
      throw new ReservationNotFound();
    }

    if (reservation.status === ReservationStatus.CANCELED) {
      throw new InvalidReservationStatusTransition();
    }

    const excursion = vehicleBooking
      ? await this.excursionRepository.findById({
          id: vehicleBooking.excursionId,
        })
      : null;

    if (!excursion || BLOCKED_EXCURSION_STATUSES.includes(excursion.status)) {
      throw new ReservationExcursionNotAvailableForStatusChange();
    }

    return await this.reservationRepository.updateStatus({
      id,
      status: ReservationStatus.CANCELED,
      canceledAt: new Date(),
      cancelReason,
    });
  }
}
