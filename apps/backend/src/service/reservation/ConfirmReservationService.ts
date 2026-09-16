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
import { VehicleBookingCapacityExceeded } from 'src/shared/erros/cases/VehicleBookingCapacityExceeded';

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

// Quais status consomem vaga do veiculo. WAITLIST nao ocupa.
const OCCUPYING_STATUSES: ReservationStatus[] = [
  ReservationStatus.PENDING,
  ReservationStatus.CONFIRMED,
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

    if (!ALLOWED_SOURCE_STATUSES.includes(reservation.status)) {
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

    // O `if (status === WAITLIST)` que existia aqui sumiu: a contagem de
    // ocupacao agora exclui a propria reserva, entao vindo de PENDING (que ja
    // ocupa) a checagem passa sozinha. Mesma regra, sem o ramo.
    const result = await this.reservationRepository.updateStatusWithinCapacity({
      id,
      fromStatuses: ALLOWED_SOURCE_STATUSES,
      toStatus: ReservationStatus.CONFIRMED,
      occupyingStatuses: OCCUPYING_STATUSES,
    });

    if (!result.ok) {
      if (result.reason === 'CAPACITY_EXCEEDED') {
        throw new VehicleBookingCapacityExceeded();
      }

      if (result.reason === 'NOT_FOUND') {
        throw new ReservationNotFound();
      }

      // STATUS_CHANGED: alguem mexeu na reserva enquanto esperavamos o lock.
      throw new InvalidReservationStatusTransition();
    }

    return result.reservation;
  }
}
