import {
  BoardingPointRepository,
  BoardingPoints,
} from 'src/domain/BoardingPointRepository';
import { ListBoardingPointService } from './ListBoardingPointService';

describe('ListBoardingPointService', () => {
  let boardingPointRepository: jest.Mocked<BoardingPointRepository>;
  let service: ListBoardingPointService;

  const organizationId = 'org-1';

  beforeEach(() => {
    boardingPointRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new ListBoardingPointService(boardingPointRepository);
  });

  it('lista os boarding points da organização informada, com vehicleBooking incluído', async () => {
    const boardingPoints = [
      {
        id: 'bp-1',
        organizationId,
        vehicleBooking: { id: 'vb-1' },
      },
    ] as BoardingPoints[];
    boardingPointRepository.findAll.mockResolvedValue(boardingPoints);

    const result = await service.execute({ organizationId });

    expect(boardingPointRepository.findAll).toHaveBeenCalledWith({
      organizationId,
    });
    expect(result).toEqual(boardingPoints);
  });
});
