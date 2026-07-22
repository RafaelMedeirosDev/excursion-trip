import { InvalidStateError } from '../base/InvalidStateError';

const message = 'Return date cannot be before departure date.' as const;
const error = 'excursion_invalid_date_range' as const;

export class ExcursionInvalidDateRange extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
