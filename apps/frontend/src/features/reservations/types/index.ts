import type { ReservationStatus } from "@excursion-trip/shared";
import type { BoardingPoint } from "@/features/boardingPoints/types";
import type { Customer } from "@/features/customers/types";
import type { User } from "@/features/users/types";
import type { VehicleBooking } from "@/features/vehicleBookings/types";

export interface Reservation {
  id: string;
  organizationId: string;
  userId: string;
  customerId: string;
  vehicleBookingId: string;
  boardingPointId: string | null;
  status: ReservationStatus;
  agreedValue: number;
  canceledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ReservationWithRelations extends Reservation {
  customer: Customer;
  vehicleBooking: VehicleBooking;
  boardingPoint: BoardingPoint | null;
  user: User;
}

export interface CreateReservationPayload {
  customerId: string;
  vehicleBookingId: string;
  boardingPointId?: string;
  agreedValue: number;
}

export interface CancelReservationPayload {
  cancelReason: string;
}
