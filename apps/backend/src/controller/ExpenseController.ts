import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Expense } from '@prisma/client';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateExpenseService } from 'src/service/CreateExpenseService';
import { CreateExpenseDTO } from 'src/shared/dtos/CreateExpenseDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExpenseController {
  constructor(private readonly createExpenseService: CreateExpenseService) {}

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
}
