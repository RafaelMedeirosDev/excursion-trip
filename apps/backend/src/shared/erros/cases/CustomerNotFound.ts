import { NotFoundError } from '../base/NotFoundError';

const message = 'Customer not found.' as const;
const error = 'customer_not_found' as const;

export class CustomerNotFound extends NotFoundError {
  constructor() {
    super(message, error);
  }
}
