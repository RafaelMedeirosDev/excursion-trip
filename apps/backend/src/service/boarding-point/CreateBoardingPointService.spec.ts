import { BoardingPoint, VehicleBooking } from '@prisma/client';
import { BoardingPointRepository } from 'src/domain/BoardingPointRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { VehicleBookingNotFound } from 'src/shared/erros/cases/VehicleBookingNotFound';
import { CreateBoardingPointService } from './CreateBoardingPointService';

describe('CreateBoardingPointService', () => {
  let boardingPointRepository: jest.Mocked<BoardingPointRepository>;
  let vehicleBookingRepository: jest.Mocked<VehicleBookingRepository>;
  let service: CreateBoardingPointService;

  const organizationId = 'org-1';

  const request = {
    organizationId,
    vehicleBookingId: 'vb-1',
    address: 'Praça Central, 100',
    time: '19:30',
  };

  beforeEach(() => {
    boardingPointRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    vehicleBookingRepository = {
      create: jest.fn(),
      findByExcursionAndPlate: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new CreateBoardingPointService(
      boardingPointRepository,
      vehicleBookingRepository,
    );

    vehicleBookingRepository.findById.mockResolvedValue({
      id: 'vb-1',
      organizationId,
    } as VehicleBooking);
  });

  it('cria o ponto de embarque quando o vehicleBooking pertence à organização', async () => {
    boardingPointRepository.create.mockResolvedValue({
      id: 'bp-1',
    } as BoardingPoint);

    const result = await service.execute(request);

    expect(boardingPointRepository.create).toHaveBeenCalledWith(request);
    expect(result).toEqual({ id: 'bp-1' });
  });

  it('lança VehicleBookingNotFound quando o vehicleBooking não existe', async () => {
    vehicleBookingRepository.findById.mockResolvedValue(null);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      VehicleBookingNotFound,
    );
    expect(boardingPointRepository.create).not.toHaveBeenCalled();
  });

  it('lança VehicleBookingNotFound quando o vehicleBooking é de outra organização', async () => {
    vehicleBookingRepository.findById.mockResolvedValue({
      id: 'vb-1',
      organizationId: 'org-2',
    } as VehicleBooking);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      VehicleBookingNotFound,
    );
    expect(boardingPointRepository.create).not.toHaveBeenCalled();
  });
});
