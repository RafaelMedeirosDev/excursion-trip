import { NotFoundError } from '../base/NotFoundError';

const message = 'Reservation not found.' as const;
const error = 'reservation_not_found' as const;

export class ReservationNotFound extends NotFoundError {
  constructor() {
    super(message, error);
  }
}
