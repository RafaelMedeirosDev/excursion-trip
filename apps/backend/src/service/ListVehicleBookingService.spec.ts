import {
  VehicleBookingRepository,
  VehicleBookings,
} from 'src/domain/VehicleBookingRepository';
import { ListVehicleBookingService } from './ListVehicleBookingService';

describe('ListVehicleBookingService', () => {
  let vehicleBookingRepository: jest.Mocked<VehicleBookingRepository>;
  let service: ListVehicleBookingService;

  const organizationId = 'org-1';

  beforeEach(() => {
    vehicleBookingRepository = {
      create: jest.fn(),
      findByExcursionAndPlate: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    service = new ListVehicleBookingService(vehicleBookingRepository);
  });

  it('lista os vehicle bookings da organização informada, com excursion/supplier/user incluídos', async () => {
    const vehicleBookings = [
      {
        id: 'vb-1',
        organizationId,
        excursion: { id: 'excursion-1' },
        supplier: { id: 'supplier-1' },
        user: { id: 'user-1' },
      },
    ] as VehicleBookings[];
    vehicleBookingRepository.findAll.mockResolvedValue(vehicleBookings);

    const result = await service.execute({ organizationId });

    expect(vehicleBookingRepository.findAll).toHaveBeenCalledWith({
      organizationId,
    });
    expect(result).toEqual(vehicleBookings);
  });
});
