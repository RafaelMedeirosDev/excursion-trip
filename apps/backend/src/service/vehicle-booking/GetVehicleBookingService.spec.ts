import { Role, VehicleBooking } from '@prisma/client';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { VehicleBookingNotFound } from 'src/shared/erros/cases/VehicleBookingNotFound';
import { GetVehicleBookingService } from './GetVehicleBookingService';

describe('GetVehicleBookingService', () => {
  let vehicleBookingRepository: jest.Mocked<VehicleBookingRepository>;
  let service: GetVehicleBookingService;

  const organizationId = 'org-1';
  const userId = 'user-1';
  const vehicleBooking = {
    id: 'vb-1',
    organizationId,
    userId,
  } as VehicleBooking;

  beforeEach(() => {
    vehicleBookingRepository = {
      create: jest.fn(),
      findByExcursionAndPlate: jest.fn(),
      countUpcomingBySupplierId: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new GetVehicleBookingService(vehicleBookingRepository);
  });

  it('ADM: retorna o vehicleBooking mesmo não sendo o responsável', async () => {
    vehicleBookingRepository.findById.mockResolvedValue(vehicleBooking);

    const result = await service.execute({
      organizationId,
      id: 'vb-1',
      userId: 'outro-user',
      role: Role.ADM,
    });

    expect(result).toEqual(vehicleBooking);
  });

  it('EMPLOYEE: retorna o vehicleBooking quando é o responsável', async () => {
    vehicleBookingRepository.findById.mockResolvedValue(vehicleBooking);

    const result = await service.execute({
      organizationId,
      id: 'vb-1',
      userId,
      role: Role.EMPLOYEE,
    });

    expect(result).toEqual(vehicleBooking);
  });

  it('EMPLOYEE: lança VehicleBookingNotFound quando não é o responsável', async () => {
    vehicleBookingRepository.findById.mockResolvedValue(vehicleBooking);

    await expect(
      service.execute({
        organizationId,
        id: 'vb-1',
        userId: 'outro-user',
        role: Role.EMPLOYEE,
      }),
    ).rejects.toBeInstanceOf(VehicleBookingNotFound);
  });

  it('lança VehicleBookingNotFound quando o vehicleBooking não existe', async () => {
    vehicleBookingRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ organizationId, id: 'vb-1', userId, role: Role.ADM }),
    ).rejects.toBeInstanceOf(VehicleBookingNotFound);
  });

  it('lança VehicleBookingNotFound quando o vehicleBooking é de outra organização', async () => {
    vehicleBookingRepository.findById.mockResolvedValue({
      ...vehicleBooking,
      organizationId: 'org-2',
    });

    await expect(
      service.execute({ organizationId, id: 'vb-1', userId, role: Role.ADM }),
    ).rejects.toBeInstanceOf(VehicleBookingNotFound);
  });
});
