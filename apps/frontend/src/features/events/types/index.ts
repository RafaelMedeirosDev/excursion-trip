import type { UF } from "@excursion-trip/shared";

export interface Event {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  city: string;
  state: UF;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  name: string;
  address: string;
  city: string;
  state: UF;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}
