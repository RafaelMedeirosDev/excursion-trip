import { Event, Excursion, ExcursionStatus } from '@prisma/client';

export interface Create {
  organizationId: string;
  eventId: string;
  userId: string;
  name: string;
  departureDate: Date;
  returnDate: Date;
}

export interface FindById {
  id: string;
}

export interface FindAll {
  organizationId: string;
}

export type Excursions = Excursion & { event: Event };

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

  abstract findById({ id }: FindById): Promise<Excursion | null>;

  abstract findAll({ organizationId }: FindAll): Promise<Excursions[]>;

  abstract updateStatus({
    id,
    status,
    canceledAt,
    cancelReason,
  }: UpdateStatus): Promise<Excursion>;
}
