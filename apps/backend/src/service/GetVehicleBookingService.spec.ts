import { VehicleBooking } from '@prisma/client';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { VehicleBookingNotFound } from 'src/shared/erros/cases/VehicleBookingNotFound';
import { GetVehicleBookingService } from './GetVehicleBookingService';

describe('GetVehicleBookingService', () => {
  let vehicleBookingRepository: jest.Mocked<VehicleBookingRepository>;
  let service: GetVehicleBookingService;

  const organizationId = 'org-1';
  const vehicleBooking = { id: 'vb-1', organizationId } as VehicleBooking;

  beforeEach(() => {
    vehicleBookingRepository = {
      create: jest.fn(),
      findByExcursionAndPlate: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    service = new GetVehicleBookingService(vehicleBookingRepository);
  });

  it('retorna o vehicleBooking quando pertence à organização', async () => {
    vehicleBookingRepository.findById.mockResolvedValue(vehicleBooking);

    const result = await service.execute({ organizationId, id: 'vb-1' });

    expect(result).toEqual(vehicleBooking);
  });

  it('lança VehicleBookingNotFound quando o vehicleBooking não existe', async () => {
    vehicleBookingRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ organizationId, id: 'vb-1' }),
    ).rejects.toBeInstanceOf(VehicleBookingNotFound);
  });

  it('lança VehicleBookingNotFound quando o vehicleBooking é de outra organização', async () => {
    vehicleBookingRepository.findById.mockResolvedValue({
      ...vehicleBooking,
      organizationId: 'org-2',
    });

    await expect(
      service.execute({ organizationId, id: 'vb-1' }),
    ).rejects.toBeInstanceOf(VehicleBookingNotFound);
  });
});
