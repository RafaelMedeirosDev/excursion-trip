import { NotFoundError } from '../base/NotFoundError';

const message = 'Supplier not found.' as const;
const error = 'supplier_not_found' as const;

export class SupplierNotFound extends NotFoundError {
  constructor() {
    super(message, error);
  }
}
