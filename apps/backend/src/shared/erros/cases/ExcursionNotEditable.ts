import { InvalidStateError } from '../base/InvalidStateError';

const message = 'Excursion cannot be edited after it is done or canceled.' as const;
const error = 'excursion_not_editable' as const;

export class ExcursionNotEditable extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
