import type { ExpensesCategory } from "@excursion-trip/shared";
import type { Excursion } from "@/features/excursions/types";
import type { User } from "@/features/users/types";
import type { VehicleBooking } from "@/features/vehicleBookings/types";

export interface Expense {
  id: string;
  organizationId: string;
  excursionId: string;
  vehicleBookingId: string | null;
  userId: string;
  category: ExpensesCategory;
  value: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface ExpenseWithRelations extends Expense {
  excursion: Excursion;
  vehicleBooking: VehicleBooking | null;
  user: User;
}

export interface CreateExpensePayload {
  excursionId: string;
  vehicleBookingId?: string;
  category: ExpensesCategory;
  value: number;
  description: string;
}
