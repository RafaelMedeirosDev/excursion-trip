import { httpClient } from "@/services/http/client";
import type {
  CreateSupplierPayload,
  PaginatedSuppliers,
  Supplier,
} from "@/features/suppliers/types";

export const suppliersApi = {
  getSuppliers: async (): Promise<Supplier[]> => {
    const { data } = await httpClient.get<Supplier[]>("/suppliers");
    return data;
  },

  getSuppliersPaginated: async (params: {
    query?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedSuppliers> => {
    const { data } = await httpClient.get<PaginatedSuppliers>(
      "/suppliers/paginated",
      { params },
    );
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
