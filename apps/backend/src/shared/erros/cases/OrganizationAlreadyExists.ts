import { AlreadyExistsError } from '../base/AlreadyExistsError';

const message = 'Organization already exists.' as const;
const error = 'organization_already_exists' as const;

export class OrganizationAlreadyExists extends AlreadyExistsError {
  constructor() {
    super(message, error);
  }
}
