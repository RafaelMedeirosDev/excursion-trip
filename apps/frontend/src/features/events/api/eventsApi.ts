import { httpClient } from "@/services/http/client";
import type { CreateEventPayload, Event } from "@/features/events/types";

export const eventsApi = {
  getEvents: async (): Promise<Event[]> => {
    const { data } = await httpClient.get<Event[]>("/events");
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
};
