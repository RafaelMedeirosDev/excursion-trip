import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Expense } from '@prisma/client';
import { Expenses } from 'src/domain/ExpenseRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateExpenseService } from 'src/service/CreateExpenseService';
import { ListExpenseService } from 'src/service/ListExpenseService';
import { CreateExpenseDTO } from 'src/shared/dtos/CreateExpenseDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpenseController {
  constructor(
    private readonly createExpenseService: CreateExpenseService,
    private readonly listExpenseService: ListExpenseService,
  ) {}

  @Post()
  create(
    @Body()
    { excursionId, vehicleBookingId, category, value, description }: CreateExpenseDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Expense> {
    return this.createExpenseService.execute({
      organizationId: currentUser.organizationId,
      userId: currentUser.sub,
      excursionId,
      vehicleBookingId,
      category,
      value,
      description,
    });
  }

  @Get()
  list(@CurrentUser() currentUser: JwtPayload): Promise<Expenses[]> {
    return this.listExpenseService.execute({
      organizationId: currentUser.organizationId,
    });
  }
}
