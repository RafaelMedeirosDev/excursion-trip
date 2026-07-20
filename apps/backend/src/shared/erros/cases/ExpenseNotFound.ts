import { NotFoundError } from '../base/NotFoundError';

const message = 'Expense not found.' as const;
const error = 'expense_not_found' as const;

export class ExpenseNotFound extends NotFoundError {
  constructor() {
    super(message, error);
  }
}
