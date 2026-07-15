import { UnauthorizedError } from '../base/UnauthorizedError';

const message = 'Invalid email or password.' as const;
const error = 'invalid_credentials' as const;

export class InvalidCredentials extends UnauthorizedError {
  constructor() {
    super(message, error);
  }
}
