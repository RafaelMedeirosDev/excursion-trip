import { BoardingPoint } from '@prisma/client';
import { BoardingPointRepository } from 'src/domain/BoardingPointRepository';
import { BoardingPointNotFound } from 'src/shared/erros/cases/BoardingPointNotFound';
import { UpdateBoardingPointService } from './UpdateBoardingPointService';

describe('UpdateBoardingPointService', () => {
  let boardingPointRepository: jest.Mocked<BoardingPointRepository>;
  let service: UpdateBoardingPointService;

  const existingBoardingPoint = {
    id: 'boarding-point-1',
    organizationId: 'org-1',
    vehicleBookingId: 'vehicle-1',
    address: 'Terminal Rodoviário do Tietê',
    time: '05:30',
  } as BoardingPoint;

  const request = { organizationId: 'org-1', id: 'boarding-point-1' };

  beforeEach(() => {
    boardingPointRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new UpdateBoardingPointService(boardingPointRepository);
    boardingPointRepository.findById.mockResolvedValue(existingBoardingPoint);
    boardingPointRepository.update.mockResolvedValue({
      id: 'boarding-point-1',
    } as BoardingPoint);
  });

  it('atualiza somente os campos informados', async () => {
    const result = await service.execute({
      ...request,
      address: 'Praça da Sé',
    });

    expect(boardingPointRepository.update).toHaveBeenCalledWith({
      id: 'boarding-point-1',
      address: 'Praça da Sé',
      time: undefined,
    });
    expect(result).toEqual({ id: 'boarding-point-1' });
  });

  it('repassa time null para limpar o horário', async () => {
    await service.execute({ ...request, time: null });

    expect(boardingPointRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ time: null }),
    );
  });

  it('lança BoardingPointNotFound quando o ponto não existe', async () => {
    boardingPointRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ ...request, address: 'Nova' }),
    ).rejects.toBeInstanceOf(BoardingPointNotFound);
    expect(boardingPointRepository.update).not.toHaveBeenCalled();
  });

  it('lança BoardingPointNotFound quando o ponto é de outra organização', async () => {
    boardingPointRepository.findById.mockResolvedValue({
      ...existingBoardingPoint,
      organizationId: 'org-2',
    } as BoardingPoint);

    await expect(
      service.execute({ ...request, address: 'Nova' }),
    ).rejects.toBeInstanceOf(BoardingPointNotFound);
    expect(boardingPointRepository.update).not.toHaveBeenCalled();
  });
});
