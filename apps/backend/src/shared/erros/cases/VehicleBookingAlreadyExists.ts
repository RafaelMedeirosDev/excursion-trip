import { AlreadyExistsError } from '../base/AlreadyExistsError';

const message =
  'A vehicle with this plate is already booked for this excursion.' as const;
const error = 'vehicle_booking_already_exists' as const;

export class VehicleBookingAlreadyExists extends AlreadyExistsError {
  constructor() {
    super(message, error);
  }
}
