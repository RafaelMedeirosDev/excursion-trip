import { InvalidStateError } from '../base/InvalidStateError';

const message = 'Vehicle booking has no available capacity.' as const;
const error = 'vehicle_booking_capacity_exceeded' as const;

export class VehicleBookingCapacityExceeded extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
