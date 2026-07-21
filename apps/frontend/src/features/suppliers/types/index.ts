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
