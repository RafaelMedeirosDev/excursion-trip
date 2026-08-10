import { Excursion, Expense, ExpensesCategory, VehicleBooking } from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { ExpenseRepository } from 'src/domain/ExpenseRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { ExcursionNotFound } from 'src/shared/erros/cases/ExcursionNotFound';
import { VehicleBookingNotFound } from 'src/shared/erros/cases/VehicleBookingNotFound';
import { CreateExpenseService } from './CreateExpenseService';

describe('CreateExpenseService', () => {
  let expenseRepository: jest.Mocked<ExpenseRepository>;
  let excursionRepository: jest.Mocked<ExcursionRepository>;
  let vehicleBookingRepository: jest.Mocked<VehicleBookingRepository>;
  let service: CreateExpenseService;

  const organizationId = 'org-1';

  const request = {
    organizationId,
    userId: 'user-1',
    excursionId: 'excursion-1',
    vehicleBookingId: 'vb-1',
    category: ExpensesCategory.FUEL,
    value: 15000,
    description: 'Combustível',
  };

  beforeEach(() => {
    expenseRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    excursionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      updateStatus: jest.fn(),
    };
    vehicleBookingRepository = {
      create: jest.fn(),
      findByExcursionAndPlate: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    service = new CreateExpenseService(
      expenseRepository,
      excursionRepository,
      vehicleBookingRepository,
    );

    excursionRepository.findById.mockResolvedValue({
      id: 'excursion-1',
      organizationId,
    } as Excursion);
    vehicleBookingRepository.findById.mockResolvedValue({
      id: 'vb-1',
      organizationId,
    } as VehicleBooking);
  });

  it('cria a despesa quando vehicleBookingId é informado e pertence à organização', async () => {
    expenseRepository.create.mockResolvedValue({ id: 'expense-1' } as Expense);

    const result = await service.execute(request);

    expect(expenseRepository.create).toHaveBeenCalledWith(request);
    expect(result).toEqual({ id: 'expense-1' });
  });

  it('cria a despesa quando vehicleBookingId não é informado (opcional)', async () => {
    expenseRepository.create.mockResolvedValue({ id: 'expense-1' } as Expense);

    await service.execute({ ...request, vehicleBookingId: undefined });

    expect(vehicleBookingRepository.findById).not.toHaveBeenCalled();
    expect(expenseRepository.create).toHaveBeenCalledWith({
      ...request,
      vehicleBookingId: undefined,
    });
  });

  it('lança ExcursionNotFound quando a excursion não existe', async () => {
    excursionRepository.findById.mockResolvedValue(null);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      ExcursionNotFound,
    );
    expect(expenseRepository.create).not.toHaveBeenCalled();
  });

  it('lança VehicleBookingNotFound quando o vehicleBookingId é de outra organização', async () => {
    vehicleBookingRepository.findById.mockResolvedValue({
      id: 'vb-1',
      organizationId: 'org-2',
    } as VehicleBooking);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      VehicleBookingNotFound,
    );
    expect(expenseRepository.create).not.toHaveBeenCalled();
  });
});
