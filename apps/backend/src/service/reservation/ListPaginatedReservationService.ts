import { Injectable } from '@nestjs/common';
import { ReservationStatus, Role } from '@prisma/client';
import {
  PaginatedReservations,
  ReservationRepository,
} from 'src/domain/ReservationRepository';

interface Request {
  organizationId: string;
  userId: string;
  role: Role;
  status?: ReservationStatus;
  eventName?: string;
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ListPaginatedReservationService {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  async execute({
    organizationId,
    userId,
    role,
    status,
    eventName,
    page,
    limit,
  }: Request): Promise<PaginatedReservations> {
    return await this.reservationRepository.findAllPaginated({
      organizationId,
      userId: role === Role.ADM ? undefined : userId,
      status,
      eventName,
      page: page ?? DEFAULT_PAGE,
      limit: limit ?? DEFAULT_LIMIT,
    });
  }
}
