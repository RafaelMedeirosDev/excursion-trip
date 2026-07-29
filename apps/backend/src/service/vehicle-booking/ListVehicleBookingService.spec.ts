import { Role } from '@prisma/client';
import {
  VehicleBookingRepository,
  VehicleBookings,
} from 'src/domain/VehicleBookingRepository';
import { ListVehicleBookingService } from './ListVehicleBookingService';

describe('ListVehicleBookingService', () => {
  let vehicleBookingRepository: jest.Mocked<VehicleBookingRepository>;
  let service: ListVehicleBookingService;

  const organizationId = 'org-1';
  const userId = 'user-1';

  beforeEach(() => {
    vehicleBookingRepository = {
      create: jest.fn(),
      findByExcursionAndPlate: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    service = new ListVehicleBookingService(vehicleBookingRepository);
  });

  it('ADM: lista todos os vehicle bookings da organização, sem filtrar por userId', async () => {
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

    const result = await service.execute({
      organizationId,
      userId,
      role: Role.ADM,
    });

    expect(vehicleBookingRepository.findAll).toHaveBeenCalledWith({
      organizationId,
      userId: undefined,
    });
    expect(result).toEqual(vehicleBookings);
  });

  it('EMPLOYEE: lista só os vehicle bookings sob responsabilidade dele (filtra por userId)', async () => {
    const vehicleBookings = [
      { id: 'vb-1', organizationId, userId },
    ] as VehicleBookings[];
    vehicleBookingRepository.findAll.mockResolvedValue(vehicleBookings);

    const result = await service.execute({
      organizationId,
      userId,
      role: Role.EMPLOYEE,
    });

    expect(vehicleBookingRepository.findAll).toHaveBeenCalledWith({
      organizationId,
      userId,
    });
    expect(result).toEqual(vehicleBookings);
  });
});
