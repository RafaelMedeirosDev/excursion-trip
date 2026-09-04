import { InvalidStateError } from '../base/InvalidStateError';

const message = 'User cannot change their own role.' as const;
const error = 'user_cannot_change_own_role' as const;

export class UserCannotChangeOwnRole extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
