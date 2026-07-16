import { NotFoundError } from '../base/NotFoundError';

const message = 'Vehicle booking not found.' as const;
const error = 'vehicle_booking_not_found' as const;

export class VehicleBookingNotFound extends NotFoundError {
  constructor() {
    super(message, error);
  }
}
