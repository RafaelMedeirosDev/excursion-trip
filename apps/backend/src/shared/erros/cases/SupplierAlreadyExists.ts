import { AlreadyExistsError } from '../base/AlreadyExistsError';

const message = 'Supplier already exists.' as const;
const error = 'supplier_already_exists' as const;

export class SupplierAlreadyExists extends AlreadyExistsError {
  constructor() {
    super(message, error);
  }
}
