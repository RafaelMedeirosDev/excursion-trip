import { InvalidStateError } from '../base/InvalidStateError';

const message =
  'Payment received is less than 50% of the agreed value.' as const;
const error = 'reservation_insufficient_payment_for_pending' as const;

export class ReservationInsufficientPaymentForPending extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
