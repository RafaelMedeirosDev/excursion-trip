import { Injectable } from '@nestjs/common';
import { ExpenseRepository, Expenses } from 'src/domain/ExpenseRepository';

interface Request {
  organizationId: string;
}

@Injectable()
export class ListExpenseService {
  constructor(private readonly expenseRepository: ExpenseRepository) {}

  async execute({ organizationId }: Request): Promise<Expenses[]> {
    return await this.expenseRepository.findAll({ organizationId });
  }
}
