import { Injectable } from '@nestjs/common';
import { Organization } from '@prisma/client';
import {
  Create,
  FindByCnpj,
  FindById,
  OrganizationRepository,
} from 'src/domain/OrganizationRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly repository: PrismaRemoteRepository) {}

  create({ name, cnpj }: Create): Promise<Organization> {
    return this.repository.organization.create({ data: { name, cnpj } });
  }

  findByCnpj({ cnpj }: FindByCnpj): Promise<Organization | null> {
    return this.repository.organization.findFirst({ where: { cnpj } });
  }

  findById({ id }: FindById): Promise<Organization | null> {
    return this.repository.organization.findFirst({ where: { id } });
  }
}
