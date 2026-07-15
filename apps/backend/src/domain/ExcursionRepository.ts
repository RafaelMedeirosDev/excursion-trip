import { Excursion } from '@prisma/client';

export interface Create {
  organizationId: string;
  eventId: string;
  userId: string;
  name: string;
  departureDate: Date;
  returnDate: Date;
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
}
