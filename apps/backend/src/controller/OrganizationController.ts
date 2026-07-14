import { Body, Controller, Post } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { CreateOrganizationService } from 'src/service/CreateOrganizationService';
import { CreateOrganizationDTO } from 'src/shared/dtos/CreateOrganizationDTO';

@Controller('/organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganizationService: CreateOrganizationService,
  ) {}

  @Post()
  create(
    @Body() { name, cnpj }: CreateOrganizationDTO,
  ): Promise<Organization> {
    return this.createOrganizationService.execute({ name, cnpj });
  }
}
