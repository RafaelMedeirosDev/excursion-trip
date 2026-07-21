import type { Excursion } from "@/features/excursions/types";
import type { Supplier } from "@/features/suppliers/types";
import type { User } from "@/features/users/types";

export interface VehicleBooking {
  id: string;
  organizationId: string;
  supplierId: string;
  excursionId: string;
  userId: string;
  vehicleType: string;
  plate: string | null;
  capacity: number;
  value: number;
  startTime: string | null;
  returnTime: string | null;
  price: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface VehicleBookingWithRelations extends VehicleBooking {
  excursion: Excursion;
  supplier: Supplier;
  user: User;
}

export interface CreateVehicleBookingPayload {
  supplierId: string;
  excursionId: string;
  userId: string;
  vehicleType: string;
  plate?: string;
  capacity: number;
  value: number;
  startTime?: string;
  returnTime?: string;
  price: number;
}
