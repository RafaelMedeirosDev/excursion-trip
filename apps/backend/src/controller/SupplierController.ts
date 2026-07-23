import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role, Supplier } from '@prisma/client';
import { Suppliers } from 'src/domain/SupplierRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateSupplierService } from 'src/service/CreateSupplierService';
import { GetSupplierService } from 'src/service/GetSupplierService';
import { ListSupplierService } from 'src/service/ListSupplierService';
import { CreateSupplierDTO } from 'src/shared/dtos/CreateSupplierDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupplierController {
  constructor(
    private readonly createSupplierService: CreateSupplierService,
    private readonly listSupplierService: ListSupplierService,
    private readonly getSupplierService: GetSupplierService,
  ) {}

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

  @Get()
  @Roles(Role.ADM)
  list(@CurrentUser() currentUser: JwtPayload): Promise<Suppliers[]> {
    return this.listSupplierService.execute({
      organizationId: currentUser.organizationId,
    });
  }

  @Get(':id')
  get(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Supplier> {
    return this.getSupplierService.execute({
      organizationId: currentUser.organizationId,
      id,
    });
  }
}
