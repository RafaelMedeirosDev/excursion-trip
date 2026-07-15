import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Customer } from '@prisma/client';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateCustomerService } from 'src/service/CreateCustomerService';
import { CreateCustomerDTO } from 'src/shared/dtos/CreateCustomerDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerController {
  constructor(private readonly createCustomerService: CreateCustomerService) {}

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
}
