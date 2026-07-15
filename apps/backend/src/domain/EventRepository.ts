import { Event } from '@prisma/client';

export interface Create {
  organizationId: string;
  name: string;
  address: string;
  city: string;
  startDate: Date;
  endDate: Date;
  startTime: string;
  endTime: string;
}

export abstract class EventRepository {
  abstract create({
    organizationId,
    name,
    address,
    city,
    startDate,
    endDate,
    startTime,
    endTime,
  }: Create): Promise<Event>;
}
