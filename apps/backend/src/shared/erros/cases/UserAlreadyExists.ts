import { AlreadyExistsError } from '../base/AlreadyExistsError';

const message = 'User already exists.' as const;
const error = 'user_already_exists' as const;

export class UserAlreadyExists extends AlreadyExistsError {
  constructor() {
    super(message, error);
  }
}
