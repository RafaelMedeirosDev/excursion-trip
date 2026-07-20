import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Expense } from '@prisma/client';
import { Expenses } from 'src/domain/ExpenseRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateExpenseService } from 'src/service/CreateExpenseService';
import { GetExpenseService } from 'src/service/GetExpenseService';
import { ListExpenseService } from 'src/service/ListExpenseService';
import { CreateExpenseDTO } from 'src/shared/dtos/CreateExpenseDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpenseController {
  constructor(
    private readonly createExpenseService: CreateExpenseService,
    private readonly listExpenseService: ListExpenseService,
    private readonly getExpenseService: GetExpenseService,
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

  @Get(':id')
  get(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Expense> {
    return this.getExpenseService.execute({
      organizationId: currentUser.organizationId,
      id,
    });
  }
}
