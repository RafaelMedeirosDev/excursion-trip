import { httpClient } from "@/services/http/client";
import type {
  CreateEventPayload,
  UpdateEventPayload,
  Event,
  PaginatedEvents,
} from "@/features/events/types";

export const eventsApi = {
  getEvents: async (): Promise<Event[]> => {
    const { data } = await httpClient.get<Event[]>("/events");
    return data;
  },

  getEventsPaginated: async (params: {
    name?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedEvents> => {
    const { data } = await httpClient.get<PaginatedEvents>(
      "/events/paginated",
      { params },
    );
    return data;
  },

  getEventById: async (id: string): Promise<Event> => {
    const { data } = await httpClient.get<Event>(`/events/${id}`);
    return data;
  },

  createEvent: async (payload: CreateEventPayload): Promise<Event> => {
    const { data } = await httpClient.post<Event>("/events", payload);
    return data;
  },

  updateEvent: async (
    id: string,
    payload: UpdateEventPayload,
  ): Promise<Event> => {
    const { data } = await httpClient.patch<Event>(`/events/${id}`, payload);
    return data;
  },
};
