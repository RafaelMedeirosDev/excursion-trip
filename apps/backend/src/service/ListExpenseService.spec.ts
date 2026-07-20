import { ExpenseRepository, Expenses } from 'src/domain/ExpenseRepository';
import { ListExpenseService } from './ListExpenseService';

describe('ListExpenseService', () => {
  let expenseRepository: jest.Mocked<ExpenseRepository>;
  let service: ListExpenseService;

  const organizationId = 'org-1';

  beforeEach(() => {
    expenseRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    service = new ListExpenseService(expenseRepository);
  });

  it('lista as expenses da organização informada, com excursion/vehicleBooking/user incluídos', async () => {
    const expenses = [
      {
        id: 'expense-1',
        organizationId,
        excursion: { id: 'excursion-1' },
        vehicleBooking: null,
        user: { id: 'user-1' },
      },
    ] as Expenses[];
    expenseRepository.findAll.mockResolvedValue(expenses);

    const result = await service.execute({ organizationId });

    expect(expenseRepository.findAll).toHaveBeenCalledWith({
      organizationId,
    });
    expect(result).toEqual(expenses);
  });
});
