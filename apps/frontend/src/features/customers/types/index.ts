export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string;
  cpf: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateCustomerPayload {
  name: string;
  email?: string;
  phone: string;
  cpf: string;
}

export interface PaginatedCustomers {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
}
