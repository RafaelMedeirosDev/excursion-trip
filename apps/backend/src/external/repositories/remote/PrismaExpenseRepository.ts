import { Injectable } from '@nestjs/common';
import { Expense } from '@prisma/client';
import { Create, ExpenseRepository } from 'src/domain/ExpenseRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

@Injectable()
export class PrismaExpenseRepository implements ExpenseRepository {
  constructor(private readonly repository: PrismaRemoteRepository) {}

  create({
    organizationId,
    excursionId,
    vehicleBookingId,
    userId,
    category,
    value,
    description,
  }: Create): Promise<Expense> {
    return this.repository.expense.create({
      data: {
        organizationId,
        excursionId,
        vehicleBookingId,
        userId,
        category,
        value,
        description,
      },
    });
  }
}
