import { Expense, ExpensesCategory } from '@prisma/client';

export interface Create {
  organizationId: string;
  excursionId: string;
  vehicleBookingId?: string;
  userId: string;
  category: ExpensesCategory;
  value: number;
  description: string;
}

export abstract class ExpenseRepository {
  abstract create({
    organizationId,
    excursionId,
    vehicleBookingId,
    userId,
    category,
    value,
    description,
  }: Create): Promise<Expense>;
}
