import { Organization } from '@prisma/client';

export interface Create {
  name: string;
  cnpj?: string;
}

export interface FindByCnpj {
  cnpj: string;
}

export interface FindById {
  id: string;
}

export abstract class OrganizationRepository {
  abstract create({ name, cnpj }: Create): Promise<Organization>;
  abstract findByCnpj({ cnpj }: FindByCnpj): Promise<Organization | null>;
  abstract findById({ id }: FindById): Promise<Organization | null>;
}
