import { httpClient } from "@/services/http/client";
import type {
  CreateCustomerPayload,
  Customer,
  PaginatedCustomers,
  UpdateCustomerPayload,
} from "@/features/customers/types";

export const customersApi = {
  getCustomers: async (): Promise<Customer[]> => {
    const { data } = await httpClient.get<Customer[]>("/customers");
    return data;
  },

  getCustomersPaginated: async (params: {
    query?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedCustomers> => {
    const { data } = await httpClient.get<PaginatedCustomers>(
      "/customers/paginated",
      { params },
    );
    return data;
  },

  getCustomerById: async (id: string): Promise<Customer> => {
    const { data } = await httpClient.get<Customer>(`/customers/${id}`);
    return data;
  },

  createCustomer: async (payload: CreateCustomerPayload): Promise<Customer> => {
    const { data } = await httpClient.post<Customer>("/customers", payload);
    return data;
  },

  updateCustomer: async (
    id: string,
    payload: UpdateCustomerPayload,
  ): Promise<Customer> => {
    const { data } = await httpClient.patch<Customer>(
      `/customers/${id}`,
      payload,
    );
    return data;
  },
};
