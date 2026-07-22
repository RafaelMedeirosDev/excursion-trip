import { AlreadyExistsError } from '../base/AlreadyExistsError';

const message =
  'This customer already has an active reservation for this event.' as const;
const error = 'reservation_already_exists' as const;

export class ReservationAlreadyExists extends AlreadyExistsError {
  constructor() {
    super(message, error);
  }
}
