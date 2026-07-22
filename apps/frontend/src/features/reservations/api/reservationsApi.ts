import type { ReservationStatus } from "@excursion-trip/shared";
import { httpClient } from "@/services/http/client";
import type {
  CancelReservationPayload,
  CreateReservationPayload,
  Reservation,
  ReservationWithRelations,
} from "@/features/reservations/types";

export const reservationsApi = {
  getReservations: async (
    status?: ReservationStatus,
  ): Promise<ReservationWithRelations[]> => {
    const { data } = await httpClient.get<ReservationWithRelations[]>(
      "/reservations",
      {
        params: status ? { status } : undefined,
      },
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
