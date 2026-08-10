import type { ReservationStatus } from "@excursion-trip/shared";
import { httpClient } from "@/services/http/client";
import type {
  CancelReservationPayload,
  CreateReservationPayload,
  PaginatedReservations,
  Reservation,
  ReservationWithRelations,
} from "@/features/reservations/types";

export const reservationsApi = {
  getReservations: async (
    status?: ReservationStatus,
    vehicleBookingId?: string,
  ): Promise<ReservationWithRelations[]> => {
    const { data } = await httpClient.get<ReservationWithRelations[]>(
      "/reservations",
      {
        params:
          status || vehicleBookingId ? { status, vehicleBookingId } : undefined,
      },
    );
    return data;
  },

  getReservationsPaginated: async (params: {
    status?: ReservationStatus;
    eventName?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedReservations> => {
    const { data } = await httpClient.get<PaginatedReservations>(
      "/reservations/paginated",
      { params },
    );
    return data;
  },

  getReservationById: async (id: string): Promise<Reservation> => {
    const { data } = await httpClient.get<Reservation>(`/reservations/${id}`);
    return data;
  },

  createReservation: async (
    payload: CreateReservationPayload,
  ): Promise<Reservation> => {
    const { data } = await httpClient.post<Reservation>(
      "/reservations",
      payload,
    );
    return data;
  },

  cancelReservation: async (
    id: string,
    payload: CancelReservationPayload,
  ): Promise<Reservation> => {
    const { data } = await httpClient.post<Reservation>(
      `/reservations/${id}/cancel`,
      payload,
    );
    return data;
  },

  markReservationPending: async (id: string): Promise<Reservation> => {
    const { data } = await httpClient.post<Reservation>(
      `/reservations/${id}/pending`,
    );
    return data;
  },

  confirmReservation: async (id: string): Promise<Reservation> => {
    const { data } = await httpClient.post<Reservation>(
      `/reservations/${id}/confirm`,
    );
    return data;
  },
};
