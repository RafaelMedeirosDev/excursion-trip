import type { Event } from "@/features/events/types";

export type ExcursionStatus =
  | "PLANNING"
  | "OPEN"
  | "CLOSED"
  | "DONE"
  | "CANCELED";

export interface Excursion {
  id: string;
  organizationId: string;
  eventId: string;
  userId: string;
  name: string;
  departureDate: string;
  returnDate: string;
  status: ExcursionStatus;
  canceledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExcursionWithEvent extends Excursion {
  event: Event;
}

export interface CreateExcursionPayload {
  eventId: string;
  name: string;
  departureDate: string;
  returnDate: string;
}

export interface UpdateExcursionStatusPayload {
  status: ExcursionStatus;
  cancelReason?: string;
}
