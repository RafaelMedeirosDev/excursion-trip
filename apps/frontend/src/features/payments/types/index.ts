import type { PaymentMethod, PaymentType } from "@excursion-trip/shared";
import type { Reservation } from "@/features/reservations/types";
import type { User } from "@/features/users/types";

export interface Payment {
  id: string;
  organizationId: string;
  reservationId: string;
  userId: string;
  type: PaymentType;
  value: number;
  method: PaymentMethod;
  createdAt: string;
}

export interface PaymentWithRelations extends Payment {
  reservation: Reservation;
  user: User;
}

export interface PaginatedPayments {
  data: PaymentWithRelations[];
  total: number;
  page: number;
  limit: number;
}

export interface CreatePaymentPayload {
  reservationId: string;
  type: PaymentType;
  value: number;
  method: PaymentMethod;
}
