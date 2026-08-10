import type { VehicleBooking } from "@/features/vehicleBookings/types";

export interface BoardingPoint {
  id: string;
  organizationId: string;
  vehicleBookingId: string;
  address: string;
  time: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface BoardingPointWithRelations extends BoardingPoint {
  vehicleBooking: VehicleBooking;
}

export interface CreateBoardingPointPayload {
  vehicleBookingId: string;
  address: string;
  time?: string;
}

export interface PaginatedBoardingPoints {
  data: BoardingPointWithRelations[];
  total: number;
  page: number;
  limit: number;
}
