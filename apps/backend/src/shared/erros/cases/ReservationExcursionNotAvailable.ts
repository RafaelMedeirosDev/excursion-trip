import { InvalidStateError } from '../base/InvalidStateError';

const message = 'Excursion is not available for new reservations.' as const;
const error = 'reservation_excursion_not_available' as const;

export class ReservationExcursionNotAvailable extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
