import { httpClient } from "@/services/http/client";
import type { CreateCustomerPayload, Customer } from "@/features/customers/types";

export const customersApi = {
  getCustomers: async (): Promise<Customer[]> => {
    const { data } = await httpClient.get<Customer[]>("/customers");
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
};
