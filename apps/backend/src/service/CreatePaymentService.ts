import { Injectable } from '@nestjs/common';
import {
  ExcursionStatus,
  Payment,
  PaymentMethod,
  PaymentType,
  Reservation,
  ReservationStatus,
} from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { PaymentRepository } from 'src/domain/PaymentRepository';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { ReservationNotFound } from 'src/shared/erros/cases/ReservationNotFound';

interface Request {
  organizationId: string;
  userId: string;
  reservationId: string;
  type: PaymentType;
  value: number;
  method: PaymentMethod;
}

const BLOCKED_EXCURSION_STATUSES: ExcursionStatus[] = [
  ExcursionStatus.DONE,
  ExcursionStatus.CANCELED,
];

const MINIMUM_PAYMENT_PERCENTAGE = 0.5;

const OCCUPYING_STATUSES: ReservationStatus[] = [
  ReservationStatus.PENDING,
  ReservationStatus.CONFIRMED,
];

@Injectable()
export class CreatePaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly reservationRepository: ReservationRepository,
    private readonly vehicleBookingRepository: VehicleBookingRepository,
    private readonly excursionRepository: ExcursionRepository,
  ) {}

  async execute({
    organizationId,
    userId,
    reservationId,
    type,
    value,
    method,
  }: Request): Promise<Payment> {
    const reservation = await this.reservationRepository.findById({
      id: reservationId,
    });

    if (!reservation || reservation.organizationId !== organizationId) {
      throw new ReservationNotFound();
    }

    const payment = await this.paymentRepository.create({
      organizationId,
      userId,
      reservationId,
      type,
      value,
      method,
    });

    await this.syncReservationStatus(reservation);

    return payment;
  }

  private async syncReservationStatus(reservation: Reservation): Promise<void> {
    if (reservation.status === ReservationStatus.CANCELED) {
      return;
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
      return;
    }

    const payments = await this.paymentRepository.findByReservationId({
      reservationId: reservation.id,
    });

    const paid = payments.reduce(
      (sum, payment) =>
        sum + (payment.type === PaymentType.REVERSAL ? -payment.value : payment.value),
      0,
    );

    const targetStatus =
      paid >= reservation.agreedValue
        ? ReservationStatus.CONFIRMED
        : paid >= reservation.agreedValue * MINIMUM_PAYMENT_PERCENTAGE
          ? ReservationStatus.PENDING
          : ReservationStatus.WAITLIST;

    if (targetStatus === reservation.status) {
      return;
    }

    const startsOccupying =
      !OCCUPYING_STATUSES.includes(reservation.status) &&
      OCCUPYING_STATUSES.includes(targetStatus);

    if (startsOccupying) {
      const occupied = await this.reservationRepository.countActiveByVehicleBookingId({
        vehicleBookingId: reservation.vehicleBookingId,
      });

      if (occupied >= vehicleBooking!.capacity) {
        return;
      }
    }

    await this.reservationRepository.updateStatus({
      id: reservation.id,
      status: targetStatus,
    });
  }
}
