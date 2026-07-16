import { AlreadyExistsError } from '../base/AlreadyExistsError';

const message =
  'This customer already has a reservation for this vehicle booking.' as const;
const error = 'reservation_already_exists' as const;

export class ReservationAlreadyExists extends AlreadyExistsError {
  constructor() {
    super(message, error);
  }
}
