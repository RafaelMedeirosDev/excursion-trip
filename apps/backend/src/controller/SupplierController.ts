import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role, Supplier } from '@prisma/client';
import { PaginatedSuppliers, Suppliers } from 'src/domain/SupplierRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateSupplierService } from 'src/service/supplier/CreateSupplierService';
import { DeleteSupplierService } from 'src/service/supplier/DeleteSupplierService';
import { GetSupplierService } from 'src/service/supplier/GetSupplierService';
import { ListSupplierService } from 'src/service/supplier/ListSupplierService';
import { ListPaginatedSupplierService } from 'src/service/supplier/ListPaginatedSupplierService';
import { UpdateSupplierService } from 'src/service/supplier/UpdateSupplierService';
import { CreateSupplierDTO } from 'src/shared/dtos/CreateSupplierDTO';
import { ListPaginatedSupplierDTO } from 'src/shared/dtos/ListPaginatedSupplierDTO';
import { UpdateSupplierDTO } from 'src/shared/dtos/UpdateSupplierDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupplierController {
  constructor(
    private readonly createSupplierService: CreateSupplierService,
    private readonly listSupplierService: ListSupplierService,
    private readonly listPaginatedSupplierService: ListPaginatedSupplierService,
    private readonly getSupplierService: GetSupplierService,
    private readonly updateSupplierService: UpdateSupplierService,
    private readonly deleteSupplierService: DeleteSupplierService,
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

  @Get('paginated')
  @Roles(Role.ADM)
  listPaginated(
    @Query() { query, page, limit }: ListPaginatedSupplierDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<PaginatedSuppliers> {
    return this.listPaginatedSupplierService.execute({
      organizationId: currentUser.organizationId,
      query,
      page,
      limit,
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

  // @Roles obrigatório aqui: o GET :id desse controller é aberto a qualquer
  // autenticado (EMPLOYEE hidratando o detalhe do veículo), então a rota nova
  // não herda restrição de lugar nenhum
  @Patch(':id')
  @Roles(Role.ADM)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { name, cnpj, address, phone }: UpdateSupplierDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Supplier> {
    return this.updateSupplierService.execute({
      organizationId: currentUser.organizationId,
      id,
      name,
      cnpj,
      address,
      phone,
    });
  }

  @Delete(':id')
  @Roles(Role.ADM)
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<void> {
    return this.deleteSupplierService.execute({
      organizationId: currentUser.organizationId,
      id,
    });
  }
}
