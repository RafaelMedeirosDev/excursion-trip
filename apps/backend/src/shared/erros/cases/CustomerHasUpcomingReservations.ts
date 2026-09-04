import { InvalidStateError } from '../base/InvalidStateError';

const message =
  'Customer has reservations on excursions that have not happened yet.' as const;
const error = 'customer_has_upcoming_reservations' as const;

export class CustomerHasUpcomingReservations extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
