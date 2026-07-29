import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Organization, Role } from '@prisma/client';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateOrganizationService } from 'src/service/organization/CreateOrganizationService';
import { CreateOrganizationDTO } from 'src/shared/dtos/CreateOrganizationDTO';

@Controller('/organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationController {
  constructor(
    private readonly createOrganizationService: CreateOrganizationService,
  ) {}

  @Post()
  @Roles(Role.ADM)
  create(
    @Body() { name, cnpj }: CreateOrganizationDTO,
  ): Promise<Organization> {
    return this.createOrganizationService.execute({ name, cnpj });
  }
}
