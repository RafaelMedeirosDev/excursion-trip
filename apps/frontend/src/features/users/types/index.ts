import type { Role } from "@excursion-trip/shared";

export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  role: Role;
}
