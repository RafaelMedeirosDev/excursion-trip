import { Injectable } from '@nestjs/common';
import {
  ExcursionStatus,
  PaymentType,
  Reservation,
  ReservationStatus,
  Role,
} from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { PaymentRepository } from 'src/domain/PaymentRepository';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { InvalidReservationStatusTransition } from 'src/shared/erros/cases/InvalidReservationStatusTransition';
import { ReservationExcursionNotAvailableForStatusChange } from 'src/shared/erros/cases/ReservationExcursionNotAvailableForStatusChange';
import { ReservationInsufficientPaymentForConfirm } from 'src/shared/erros/cases/ReservationInsufficientPaymentForConfirm';
import { ReservationNotFound } from 'src/shared/erros/cases/ReservationNotFound';

interface Request {
  organizationId: string;
  userId: string;
  role: Role;
  id: string;
}

const ALLOWED_SOURCE_STATUSES: ReservationStatus[] = [
  ReservationStatus.WAITLIST,
  ReservationStatus.PENDING,
];

const BLOCKED_EXCURSION_STATUSES: ExcursionStatus[] = [
  ExcursionStatus.DONE,
  ExcursionStatus.CANCELED,
];

@Injectable()
export class ConfirmReservationService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
    private readonly vehicleBookingRepository: VehicleBookingRepository,
    private readonly excursionRepository: ExcursionRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async execute({
    organizationId,
    userId,
    role,
    id,
  }: Request): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById({ id });

    if (!reservation || reservation.organizationId !== organizationId) {
      throw new ReservationNotFound();
    }

    if (role !== Role.ADM && reservation.userId !== userId) {
      throw new ReservationNotFound();
    }

    if (!ALLOWED_SOURCE_STATUSES.includes(reservation.status)) {
      throw new InvalidReservationStatusTransition();
    }

    const vehicleBooking = await this.vehicleBookingRepository.findById({
      id: reservation.vehicleBookingId,
    });

    const excursion = vehicleBooking
      ? await this.excursionRepository.findById({
          id: vehicleBooking.excursionId,
        })
      : null;

    if (!excursion || BLOCKED_EXCURSION_STATUSES.includes(excursion.status)) {
      throw new ReservationExcursionNotAvailableForStatusChange();
    }

    const payments = await this.paymentRepository.findByReservationId({
      reservationId: id,
    });

    const paid = payments.reduce(
      (sum, payment) =>
        sum + (payment.type === PaymentType.REVERSAL ? -payment.value : payment.value),
      0,
    );

    if (paid < reservation.agreedValue) {
      throw new ReservationInsufficientPaymentForConfirm();
    }

    return await this.reservationRepository.updateStatus({
      id,
      status: ReservationStatus.CONFIRMED,
    });
  }
}
