import {
  BoardingPointRepository,
  PaginatedBoardingPoints,
} from 'src/domain/BoardingPointRepository';
import { ListPaginatedBoardingPointService } from './ListPaginatedBoardingPointService';

describe('ListPaginatedBoardingPointService', () => {
  let boardingPointRepository: jest.Mocked<BoardingPointRepository>;
  let service: ListPaginatedBoardingPointService;

  const organizationId = 'org-1';

  beforeEach(() => {
    boardingPointRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new ListPaginatedBoardingPointService(boardingPointRepository);
  });

  it('repassa address, page e limit quando informados', async () => {
    const paginated: PaginatedBoardingPoints = {
      data: [],
      total: 0,
      page: 2,
      limit: 5,
    };
    boardingPointRepository.findAllPaginated.mockResolvedValue(paginated);

    const result = await service.execute({
      organizationId,
      address: 'Rua das Flores',
      page: 2,
      limit: 5,
    });

    expect(boardingPointRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      address: 'Rua das Flores',
      page: 2,
      limit: 5,
    });
    expect(result).toEqual(paginated);
  });

  it('usa page=1/limit=10 por padrão quando não informados', async () => {
    boardingPointRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    await service.execute({ organizationId });

    expect(boardingPointRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      address: undefined,
      page: 1,
      limit: 10,
    });
  });
});
