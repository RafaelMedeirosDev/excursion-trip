import { Injectable } from '@nestjs/common';
import { Expense } from '@prisma/client';
import { ExpenseRepository } from 'src/domain/ExpenseRepository';
import { ExpenseNotFound } from 'src/shared/erros/cases/ExpenseNotFound';

interface Request {
  organizationId: string;
  id: string;
}

@Injectable()
export class GetExpenseService {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute({ organizationId, id }: Request): Promise<Expense> {
    const expense = await this.expenseRepository.findById({ id });

    if (!expense || expense.organizationId !== organizationId) {
      throw new ExpenseNotFound();
    }

    return expense;
  }
}
