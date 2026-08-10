import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Customer } from '@prisma/client';
import { Customers, PaginatedCustomers } from 'src/domain/CustomerRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateCustomerService } from 'src/service/customer/CreateCustomerService';
import { GetCustomerService } from 'src/service/customer/GetCustomerService';
import { ListCustomerService } from 'src/service/customer/ListCustomerService';
import { ListPaginatedCustomerService } from 'src/service/customer/ListPaginatedCustomerService';
import { CreateCustomerDTO } from 'src/shared/dtos/CreateCustomerDTO';
import { ListPaginatedCustomerDTO } from 'src/shared/dtos/ListPaginatedCustomerDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerController {
  constructor(
    private readonly createCustomerService: CreateCustomerService,
    private readonly listCustomerService: ListCustomerService,
    private readonly listPaginatedCustomerService: ListPaginatedCustomerService,
    private readonly getCustomerService: GetCustomerService,
  ) {}

  @Post()
  create(
    @Body() { name, email, phone, cpf }: CreateCustomerDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Customer> {
    return this.createCustomerService.execute({
      organizationId: currentUser.organizationId,
      name,
      email,
      phone,
      cpf,
    });
  }

  @Get()
  list(@CurrentUser() currentUser: JwtPayload): Promise<Customers[]> {
    return this.listCustomerService.execute({
      organizationId: currentUser.organizationId,
    });
  }

  @Get('paginated')
  listPaginated(
    @Query() { query, page, limit }: ListPaginatedCustomerDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<PaginatedCustomers> {
    return this.listPaginatedCustomerService.execute({
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
  ): Promise<Customer> {
    return this.getCustomerService.execute({
      organizationId: currentUser.organizationId,
      id,
    });
  }
}
