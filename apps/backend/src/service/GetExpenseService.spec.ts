import { Expense } from '@prisma/client';
import { ExpenseRepository } from 'src/domain/ExpenseRepository';
import { ExpenseNotFound } from 'src/shared/erros/cases/ExpenseNotFound';
import { GetExpenseService } from './GetExpenseService';

describe('GetExpenseService', () => {
  let expenseRepository: jest.Mocked<ExpenseRepository>;
  let service: GetExpenseService;

  const organizationId = 'org-1';
  const expense = { id: 'expense-1', organizationId } as Expense;

  beforeEach(() => {
    expenseRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    service = new GetExpenseService(expenseRepository);
  });

  it('retorna o expense quando pertence à organização', async () => {
    expenseRepository.findById.mockResolvedValue(expense);

    const result = await service.execute({
      organizationId,
      id: 'expense-1',
    });

    expect(result).toEqual(expense);
  });

  it('lança ExpenseNotFound quando o expense não existe', async () => {
    expenseRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ organizationId, id: 'expense-1' }),
    ).rejects.toBeInstanceOf(ExpenseNotFound);
  });

  it('lança ExpenseNotFound quando o expense é de outra organização', async () => {
    expenseRepository.findById.mockResolvedValue({
      ...expense,
      organizationId: 'org-2',
    });

    await expect(
      service.execute({ organizationId, id: 'expense-1' }),
    ).rejects.toBeInstanceOf(ExpenseNotFound);
  });
});
