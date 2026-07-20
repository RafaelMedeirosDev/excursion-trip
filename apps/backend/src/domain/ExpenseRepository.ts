import {
  Excursion,
  Expense,
  ExpensesCategory,
  User,
  VehicleBooking,
} from '@prisma/client';

export interface Create {
  organizationId: string;
  excursionId: string;
  vehicleBookingId?: string;
  userId: string;
  category: ExpensesCategory;
  value: number;
  description: string;
}

export interface FindById {
  id: string;
}

export interface FindAll {
  organizationId: string;
}

export type Expenses = Omit<Expense, 'deletedAt'> & {
  excursion: Excursion;
  vehicleBooking: Omit<VehicleBooking, 'deletedAt'> | null;
  user: Omit<User, 'password' | 'deletedAt'>;
};

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

  abstract findById({ id }: FindById): Promise<Expense | null>;

  abstract findAll({ organizationId }: FindAll): Promise<Expenses[]>;
}
