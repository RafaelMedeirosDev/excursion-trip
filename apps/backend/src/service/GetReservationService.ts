import { Injectable } from '@nestjs/common';
import { Reservation, Role } from '@prisma/client';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { ReservationNotFound } from 'src/shared/erros/cases/ReservationNotFound';

interface Request {
  organizationId: string;
  id: string;
  userId: string;
  role: Role;
}

@Injectable()
export class GetReservationService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute({
    organizationId,
    id,
    userId,
    role,
  }: Request): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById({ id });

    if (!reservation || reservation.organizationId !== organizationId) {
      throw new ReservationNotFound();
    }

    if (role !== Role.ADM && reservation.userId !== userId) {
      throw new ReservationNotFound();
    }

    return reservation;
  }
}
