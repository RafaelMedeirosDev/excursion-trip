import { httpClient } from "@/services/http/client";
import type {
  CreatePaymentPayload,
  PaginatedPayments,
  Payment,
  PaymentWithRelations,
} from "@/features/payments/types";

export const paymentsApi = {
  getPayments: async (): Promise<PaymentWithRelations[]> => {
    const { data } = await httpClient.get<PaymentWithRelations[]>("/payments");
    return data;
  },

  getPaymentsPaginated: async (params: {
    query?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedPayments> => {
    const { data } = await httpClient.get<PaginatedPayments>(
      "/payments/paginated",
      { params },
    );
    return data;
  },

  getPaymentById: async (id: string): Promise<Payment> => {
    const { data } = await httpClient.get<Payment>(`/payments/${id}`);
    return data;
  },

  createPayment: async (payload: CreatePaymentPayload): Promise<Payment> => {
    const { data } = await httpClient.post<Payment>("/payments", payload);
    return data;
  },
};
