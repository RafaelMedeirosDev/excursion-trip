import { NotFoundError } from '../base/NotFoundError';

const message = 'Payment not found.' as const;
const error = 'payment_not_found' as const;

export class PaymentNotFound extends NotFoundError {
  constructor() {
    super(message, error);
  }
}
