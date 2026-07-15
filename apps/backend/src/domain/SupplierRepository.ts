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
}
