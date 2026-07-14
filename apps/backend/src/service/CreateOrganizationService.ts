import { Injectable } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { OrganizationRepository } from 'src/domain/OrganizationRepository';
import { OrganizationAlreadyExists } from 'src/shared/erros/cases/OrganizationAlreadyExists';

interface Request {
  name: string;
  cnpj?: string;
}

@Injectable()
export class CreateOrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute({ name, cnpj }: Request): Promise<Organization> {
    if (cnpj) {
      const alreadyExists = await this.organizationRepository.findByCnpj({
        cnpj,
      });

      if (alreadyExists) {
        throw new OrganizationAlreadyExists();
      }
    }

    return await this.organizationRepository.create({ name, cnpj });
  }
}
