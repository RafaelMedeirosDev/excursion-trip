import { InvalidStateError } from '../base/InvalidStateError';

const message =
  'Excursion is not available for reservation status changes.' as const;
const error = 'reservation_excursion_not_available_for_status_change' as const;

export class ReservationExcursionNotAvailableForStatusChange extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
