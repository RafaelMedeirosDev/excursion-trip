import { ExcursionStatus } from '@prisma/client';
import {
  ExcursionRepository,
  PaginatedExcursions,
} from 'src/domain/ExcursionRepository';
import { ListPaginatedExcursionService } from './ListPaginatedExcursionService';

describe('ListPaginatedExcursionService', () => {
  let excursionRepository: jest.Mocked<ExcursionRepository>;
  let service: ListPaginatedExcursionService;

  const organizationId = 'org-1';

  beforeEach(() => {
    excursionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      updateStatus: jest.fn(),
    };
    service = new ListPaginatedExcursionService(excursionRepository);
  });

  it('repassa organizationId/page/limit pro findAllPaginated', async () => {
    const paginated: PaginatedExcursions = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    };
    excursionRepository.findAllPaginated.mockResolvedValue(paginated);

    const result = await service.execute({ organizationId, page: 1, limit: 10 });

    expect(excursionRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      status: undefined,
      eventName: undefined,
      page: 1,
      limit: 10,
    });
    expect(result).toEqual(paginated);
  });

  it('repassa status e eventName quando informados', async () => {
    excursionRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 2,
      limit: 5,
    });

    await service.execute({
      organizationId,
      status: ExcursionStatus.OPEN,
      eventName: 'Reveillon',
      page: 2,
      limit: 5,
    });

    expect(excursionRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      status: ExcursionStatus.OPEN,
      eventName: 'Reveillon',
      page: 2,
      limit: 5,
    });
  });
});
