import { InvalidStateError } from '../base/InvalidStateError';

const message = 'Invalid excursion status transition.' as const;
const error = 'invalid_excursion_status_transition' as const;

export class InvalidExcursionStatusTransition extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
