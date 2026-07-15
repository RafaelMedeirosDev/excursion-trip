import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Role, Supplier } from '@prisma/client';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateSupplierService } from 'src/service/CreateSupplierService';
import { CreateSupplierDTO } from 'src/shared/dtos/CreateSupplierDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupplierController {
  constructor(private readonly createSupplierService: CreateSupplierService) {}

  @Post()
  @Roles(Role.ADM)
  create(
    @Body() { name, cnpj, address, phone }: CreateSupplierDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Supplier> {
    return this.createSupplierService.execute({
      organizationId: currentUser.organizationId,
      name,
      cnpj,
      address,
      phone,
    });
  }
}
