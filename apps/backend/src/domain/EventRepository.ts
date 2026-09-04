import { Event, UF } from '@prisma/client';

export interface Create {
  organizationId: string;
  name: string;
  address: string;
  city: string;
  state: UF;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
}

export interface Update {
  id: string;
  name?: string;
  address?: string;
  city?: string;
  state?: UF;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
}

export interface FindById {
  id: string;
}

export interface FindAll {
  organizationId: string;
}

export interface FindAllPaginated {
  organizationId: string;
  name?: string;
  page: number;
  limit: number;
}

export type Events = Omit<Event, 'deletedAt'>;

export interface PaginatedEvents {
  data: Events[];
  total: number;
  page: number;
  limit: number;
}

export abstract class EventRepository {
  abstract create({
    organizationId,
    name,
    address,
    city,
    state,
    startDate,
    endDate,
    startTime,
    endTime,
  }: Create): Promise<Event>;

  abstract update({
    id,
    name,
    address,
    city,
    state,
    startDate,
    endDate,
    startTime,
    endTime,
  }: Update): Promise<Event>;

  abstract findById({ id }: FindById): Promise<Event | null>;

  abstract findAll({ organizationId }: FindAll): Promise<Events[]>;

  abstract findAllPaginated({
    organizationId,
    name,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedEvents>;
}
