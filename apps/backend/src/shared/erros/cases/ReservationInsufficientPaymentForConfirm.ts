import { InvalidStateError } from '../base/InvalidStateError';

const message =
  'Payment received is less than 100% of the agreed value.' as const;
const error = 'reservation_insufficient_payment_for_confirm' as const;

export class ReservationInsufficientPaymentForConfirm extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
