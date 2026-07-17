import { Supplier } from '@prisma/client';

export interface Create {
  organizationId: string;
  name: string;
  cnpj: string;
  address?: string;
  phone: string;
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

export type Suppliers = Omit<Supplier, 'deletedAt'>;

export abstract class SupplierRepository {
  abstract create({
    organizationId,
    name,
    cnpj,
    address,
    phone,
  }: Create): Promise<Supplier>;

  abstract findByCnpj({
    organizationId,
    cnpj,
  }: FindByCnpj): Promise<Supplier | null>;

  abstract findById({ id }: FindById): Promise<Supplier | null>;

  abstract findAll({ organizationId }: FindAll): Promise<Suppliers[]>;
}
