import { Customer } from '@prisma/client';

export interface Create {
  organizationId: string;
  name: string;
  email?: string;
  phone: string;
  cpf: string;
}

export interface Update {
  id: string;
  name?: string;
  email?: string | null;
  phone?: string;
  cpf?: string;
}

export interface SoftDelete {
  id: string;
}

// restaura um passageiro excluído com os dados do novo cadastro; separado do
// Update de propósito, pra edição normal não conseguir ressuscitar ninguém
export interface Restore {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
}

export interface FindByCpf {
  organizationId: string;
  cpf: string;
}

export interface FindById {
  id: string;
}

export interface FindAll {
  organizationId: string;
}

export interface FindAllPaginated {
  organizationId: string;
  query?: string;
  page: number;
  limit: number;
}

export type Customers = Omit<Customer, 'deletedAt'>;

export interface PaginatedCustomers {
  data: Customers[];
  total: number;
  page: number;
  limit: number;
}

export abstract class CustomerRepository {
  abstract create({
    organizationId,
    name,
    email,
    phone,
    cpf,
  }: Create): Promise<Customer>;

  abstract update({ id, name, email, phone, cpf }: Update): Promise<Customer>;

  abstract softDelete({ id }: SoftDelete): Promise<void>;

  abstract restore({ id, name, email, phone }: Restore): Promise<Customer>;

  abstract findByCpf({
    organizationId,
    cpf,
  }: FindByCpf): Promise<Customer | null>;

  abstract findById({ id }: FindById): Promise<Customer | null>;

  abstract findAll({ organizationId }: FindAll): Promise<Customers[]>;

  abstract findAllPaginated({
    organizationId,
    query,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedCustomers>;
}
