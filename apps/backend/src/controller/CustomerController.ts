import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Customer } from '@prisma/client';
import { Customers } from 'src/domain/CustomerRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateCustomerService } from 'src/service/CreateCustomerService';
import { ListCustomerService } from 'src/service/ListCustomerService';
import { CreateCustomerDTO } from 'src/shared/dtos/CreateCustomerDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerController {
  constructor(
    private readonly createCustomerService: CreateCustomerService,
    private readonly listCustomerService: ListCustomerService,
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
}
