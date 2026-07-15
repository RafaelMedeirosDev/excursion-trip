import { NotFoundError } from '../base/NotFoundError';

const message = 'Event not found.' as const;
const error = 'event_not_found' as const;

export class EventNotFound extends NotFoundError {
  constructor() {
    super(message, error);
  }
}
