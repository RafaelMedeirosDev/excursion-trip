import { InvalidStateError } from '../base/InvalidStateError';

const message = 'User cannot delete themselves.' as const;
const error = 'user_cannot_delete_themselves' as const;

export class UserCannotDeleteThemselves extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
