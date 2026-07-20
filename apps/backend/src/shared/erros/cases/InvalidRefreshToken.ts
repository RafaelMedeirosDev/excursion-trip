import { UnauthorizedError } from '../base/UnauthorizedError';

const message = 'Invalid or expired refresh token.' as const;
const error = 'invalid_refresh_token' as const;

export class InvalidRefreshToken extends UnauthorizedError {
  constructor() {
    super(message, error);
  }
}
