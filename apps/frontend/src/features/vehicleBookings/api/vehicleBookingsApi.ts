import { httpClient } from "@/services/http/client";
import type {
  CreateVehicleBookingPayload,
  PaginatedVehicleBookings,
  VehicleBooking,
  VehicleBookingWithRelations,
} from "@/features/vehicleBookings/types";

export const vehicleBookingsApi = {
  getVehicleBookings: async (): Promise<VehicleBookingWithRelations[]> => {
    const { data } = await httpClient.get<VehicleBookingWithRelations[]>(
      "/vehicle-bookings",
    );
    return data;
  },

  getVehicleBookingsPaginated: async (params: {
    query?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedVehicleBookings> => {
    const { data } = await httpClient.get<PaginatedVehicleBookings>(
      "/vehicle-bookings/paginated",
      { params },
    );
    return data;
  },

  getVehicleBookingById: async (id: string): Promise<VehicleBooking> => {
    const { data } = await httpClient.get<VehicleBooking>(
      `/vehicle-bookings/${id}`,
    );
    return data;
  },

  createVehicleBooking: async (
    payload: CreateVehicleBookingPayload,
  ): Promise<VehicleBooking> => {
    const { data } = await httpClient.post<VehicleBooking>(
      "/vehicle-bookings",
      payload,
    );
    return data;
  },
};
