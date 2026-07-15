import { AlreadyExistsError } from '../base/AlreadyExistsError';

const message = 'Customer already exists.' as const;
const error = 'customer_already_exists' as const;

export class CustomerAlreadyExists extends AlreadyExistsError {
  constructor() {
    super(message, error);
  }
}
