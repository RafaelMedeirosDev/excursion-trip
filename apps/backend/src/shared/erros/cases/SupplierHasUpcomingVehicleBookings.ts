import { InvalidStateError } from '../base/InvalidStateError';

const message =
  'Supplier has vehicles booked on excursions that have not happened yet.' as const;
const error = 'supplier_has_upcoming_vehicle_bookings' as const;

export class SupplierHasUpcomingVehicleBookings extends InvalidStateError {
  constructor() {
    super(message, error);
  }
}
