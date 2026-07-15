import { NotFoundError } from '../base/NotFoundError';

const message = 'User not found.' as const;
const error = 'user_not_found' as const;

export class UserNotFound extends NotFoundError {
  constructor() {
    super(message, error);
  }
}
