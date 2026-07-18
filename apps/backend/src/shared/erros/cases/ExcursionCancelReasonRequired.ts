import { InvalidStateError } from '../base/InvalidStateError';

const message = 'Cancel reason is required when canceling an excursion.' as const;
const error = 'excursion_cancel_reason_required' as const;

export class ExcursionCancelReasonRequired extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
