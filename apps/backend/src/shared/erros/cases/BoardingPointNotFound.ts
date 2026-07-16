import { NotFoundError } from '../base/NotFoundError';

const message = 'Boarding point not found.' as const;
const error = 'boarding_point_not_found' as const;

export class BoardingPointNotFound extends NotFoundError {
  constructor() {
    super(message, error);
  }
}
