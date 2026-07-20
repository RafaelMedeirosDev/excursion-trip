import { Injectable } from '@nestjs/common';
import { Expense } from '@prisma/client';
import {
  Create,
  ExpenseRepository,
  Expenses,
  FindAll,
  FindById,
} from 'src/domain/ExpenseRepository';
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

  findById({ id }: FindById): Promise<Expense | null> {
    return this.repository.expense.findFirst({ where: { id } });
  }

  findAll({ organizationId }: FindAll): Promise<Expenses[]> {
    return this.repository.expense.findMany({
      where: { organizationId, deletedAt: null },
      select: {
        id: true,
        organizationId: true,
        excursionId: true,
        vehicleBookingId: true,
        userId: true,
        category: true,
        value: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        excursion: true,
        vehicleBooking: {
          select: {
            id: true,
            organizationId: true,
            supplierId: true,
            excursionId: true,
            userId: true,
            vehicleType: true,
            plate: true,
            capacity: true,
            value: true,
            startTime: true,
            returnTime: true,
            price: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        user: {
          select: {
            id: true,
            organizationId: true,
            name: true,
            email: true,
            phone: true,
            cpf: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
  }
}
