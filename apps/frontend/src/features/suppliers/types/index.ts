export interface Supplier {
  id: string;
  organizationId: string;
  name: string;
  cnpj: string;
  address: string | null;
  phone: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateSupplierPayload {
  name: string;
  cnpj: string;
  address?: string;
  phone: string;
}

export interface UpdateSupplierPayload {
  name: string;
  cnpj: string;
  address: string | null;
  phone: string;
}

export interface PaginatedSuppliers {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
}
