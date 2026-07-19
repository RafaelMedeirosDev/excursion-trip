import { InvalidStateError } from '../base/InvalidStateError';

const message = 'Invalid reservation status transition.' as const;
const error = 'invalid_reservation_status_transition' as const;

export class InvalidReservationStatusTransition extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
