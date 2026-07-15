import { Customer } from '@prisma/client';

export interface Create {
  organizationId: string;
  name: string;
  email?: string;
  phone: string;
  cpf: string;
}

export interface FindByCpf {
  organizationId: string;
  cpf: string;
}

export abstract class CustomerRepository {
  abstract create({
    organizationId,
    name,
    email,
    phone,
    cpf,
  }: Create): Promise<Customer>;

  abstract findByCpf({
    organizationId,
    cpf,
  }: FindByCpf): Promise<Customer | null>;
}
