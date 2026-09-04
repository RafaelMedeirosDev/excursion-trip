import { BoardingPoint } from '@prisma/client';
import { BoardingPointRepository } from 'src/domain/BoardingPointRepository';
import { BoardingPointNotFound } from 'src/shared/erros/cases/BoardingPointNotFound';
import { GetBoardingPointService } from './GetBoardingPointService';

describe('GetBoardingPointService', () => {
  let boardingPointRepository: jest.Mocked<BoardingPointRepository>;
  let service: GetBoardingPointService;

  const organizationId = 'org-1';
  const boardingPoint = { id: 'bp-1', organizationId } as BoardingPoint;

  beforeEach(() => {
    boardingPointRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new GetBoardingPointService(boardingPointRepository);
  });

  it('retorna o boardingPoint quando pertence à organização', async () => {
    boardingPointRepository.findById.mockResolvedValue(boardingPoint);

    const result = await service.execute({ organizationId, id: 'bp-1' });

    expect(result).toEqual(boardingPoint);
  });

  it('lança BoardingPointNotFound quando o boardingPoint não existe', async () => {
    boardingPointRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ organizationId, id: 'bp-1' }),
    ).rejects.toBeInstanceOf(BoardingPointNotFound);
  });

  it('lança BoardingPointNotFound quando o boardingPoint é de outra organização', async () => {
    boardingPointRepository.findById.mockResolvedValue({
      ...boardingPoint,
      organizationId: 'org-2',
    });

    await expect(
      service.execute({ organizationId, id: 'bp-1' }),
    ).rejects.toBeInstanceOf(BoardingPointNotFound);
  });
});
