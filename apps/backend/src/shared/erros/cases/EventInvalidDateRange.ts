import { InvalidStateError } from '../base/InvalidStateError';

const message = 'End date cannot be before start date.' as const;
const error = 'event_invalid_date_range' as const;

export class EventInvalidDateRange extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
