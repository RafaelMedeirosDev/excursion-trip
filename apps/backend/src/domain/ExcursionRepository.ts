import { Event, Excursion, ExcursionStatus } from '@prisma/client';

export interface Create {
  organizationId: string;
  eventId: string;
  userId: string;
  name: string;
  departureDate: Date;
  returnDate: Date;
}

// eventId de fora de propósito: a regra "um passageiro não pode ter duas
// reservas ativas no mesmo evento" é resolvida navegando reservation →
// vehicleBooking → excursion.eventId, então mover a excursão para outro evento
// criaria duplicatas retroativas sem erro nenhum.
// status/canceledAt/cancelReason também ficam de fora: são de UpdateStatus,
// que valida a máquina de estados.
export interface Update {
  id: string;
  name?: string;
  departureDate?: Date;
  returnDate?: Date;
}

export interface FindById {
  id: string;
}

export interface FindAll {
  organizationId: string;
  status?: ExcursionStatus;
}

export interface FindAllPaginated {
  organizationId: string;
  status?: ExcursionStatus;
  eventName?: string;
  page: number;
  limit: number;
}

export type Excursions = Excursion & { event: Event };

export interface PaginatedExcursions {
  data: Excursions[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateStatus {
  id: string;
  status: ExcursionStatus;
  canceledAt?: Date;
  cancelReason?: string;
}

export abstract class ExcursionRepository {
  abstract create({
    organizationId,
    eventId,
    userId,
    name,
    departureDate,
    returnDate,
  }: Create): Promise<Excursion>;

  abstract update({
    id,
    name,
    departureDate,
    returnDate,
  }: Update): Promise<Excursion>;

  abstract findById({ id }: FindById): Promise<Excursion | null>;

  abstract findAll({ organizationId, status }: FindAll): Promise<Excursions[]>;

  abstract findAllPaginated({
    organizationId,
    status,
    eventName,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedExcursions>;

  abstract updateStatus({
    id,
    status,
    canceledAt,
    cancelReason,
  }: UpdateStatus): Promise<Excursion>;
}
