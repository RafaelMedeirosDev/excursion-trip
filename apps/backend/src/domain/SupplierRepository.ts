import { Supplier } from '@prisma/client';

export interface Create {
  organizationId: string;
  name: string;
  cnpj: string;
  address?: string;
  phone: string;
}

export interface Update {
  id: string;
  name?: string;
  cnpj?: string;
  address?: string | null;
  phone?: string;
}

export interface FindByCnpj {
  organizationId: string;
  cnpj: string;
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

export type Suppliers = Omit<Supplier, 'deletedAt'>;

export interface PaginatedSuppliers {
  data: Suppliers[];
  total: number;
  page: number;
  limit: number;
}

export abstract class SupplierRepository {
  abstract create({
    organizationId,
    name,
    cnpj,
    address,
    phone,
  }: Create): Promise<Supplier>;

  abstract update({
    id,
    name,
    cnpj,
    address,
    phone,
  }: Update): Promise<Supplier>;

  abstract findByCnpj({
    organizationId,
    cnpj,
  }: FindByCnpj): Promise<Supplier | null>;

  abstract findById({ id }: FindById): Promise<Supplier | null>;

  abstract findAll({ organizationId }: FindAll): Promise<Suppliers[]>;

  abstract findAllPaginated({
    organizationId,
    query,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedSuppliers>;
}
