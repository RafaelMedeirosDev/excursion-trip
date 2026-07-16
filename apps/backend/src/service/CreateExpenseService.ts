import { Injectable } from '@nestjs/common';
import { Expense, ExpensesCategory } from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { ExpenseRepository } from 'src/domain/ExpenseRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { ExcursionNotFound } from 'src/shared/erros/cases/ExcursionNotFound';
import { VehicleBookingNotFound } from 'src/shared/erros/cases/VehicleBookingNotFound';

interface Request {
  organizationId: string;
  userId: string;
  excursionId: string;
  vehicleBookingId?: string;
  category: ExpensesCategory;
  value: number;
  description: string;
}

@Injectable()
export class CreateExpenseService {
  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly excursionRepository: ExcursionRepository,
    private readonly vehicleBookingRepository: VehicleBookingRepository,
  ) {}

  async execute({
    organizationId,
    userId,
    excursionId,
    vehicleBookingId,
    category,
    value,
    description,
  }: Request): Promise<Expense> {
    const excursion = await this.excursionRepository.findById({
      id: excursionId,
    });

    if (!excursion || excursion.organizationId !== organizationId) {
      throw new ExcursionNotFound();
    }

    if (vehicleBookingId) {
      const vehicleBooking = await this.vehicleBookingRepository.findById({
        id: vehicleBookingId,
      });

      if (
        !vehicleBooking ||
        vehicleBooking.organizationId !== organizationId
      ) {
        throw new VehicleBookingNotFound();
      }
    }

    return await this.expenseRepository.create({
      organizationId,
      excursionId,
      vehicleBookingId,
      userId,
      category,
      value,
      description,
    });
  }
}
