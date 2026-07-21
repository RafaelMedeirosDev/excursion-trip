import { httpClient } from "@/services/http/client";
import type { CreateSupplierPayload, Supplier } from "@/features/suppliers/types";

export const suppliersApi = {
  getSuppliers: async (): Promise<Supplier[]> => {
    const { data } = await httpClient.get<Supplier[]>("/suppliers");
    return data;
  },

  getSupplierById: async (id: string): Promise<Supplier> => {
    const { data } = await httpClient.get<Supplier>(`/suppliers/${id}`);
    return data;
  },

  createSupplier: async (payload: CreateSupplierPayload): Promise<Supplier> => {
    const { data } = await httpClient.post<Supplier>("/suppliers", payload);
    return data;
  },
};
