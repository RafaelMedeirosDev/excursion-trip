import { NotFoundError } from '../base/NotFoundError';

const message = 'Excursion not found.' as const;
const error = 'excursion_not_found' as const;

export class ExcursionNotFound extends NotFoundError {
  constructor() {
    super(message, error);
  }
}
