import { InvalidStateError } from '../base/InvalidStateError';

const message = 'Excursion is not available for new vehicle bookings.' as const;
const error = 'vehicle_booking_excursion_not_available' as const;

export class VehicleBookingExcursionNotAvailable extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
