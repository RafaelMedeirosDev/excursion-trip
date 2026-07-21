export interface Event {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  city: string;
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
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}
