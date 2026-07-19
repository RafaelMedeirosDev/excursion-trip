import { Injectable } from '@nestjs/common';
import { ReservationStatus, Role } from '@prisma/client';
import {
  Reservations,
  ReservationRepository,
} from 'src/domain/ReservationRepository';

interface Request {
  organizationId: string;
  userId: string;
  role: Role;
  status?: ReservationStatus;
}

@Injectable()
export class ListReservationService {
  constructor(
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute({
    organizationId,
    userId,
    role,
    status,
  }: Request): Promise<Reservations[]> {
    return await this.reservationRepository.findAll({
      organizationId,
      userId: role === Role.ADM ? undefined : userId,
      status,
    });
  }
}
