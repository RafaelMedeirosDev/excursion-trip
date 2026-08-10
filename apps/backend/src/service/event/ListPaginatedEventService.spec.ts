import { EventRepository, PaginatedEvents } from 'src/domain/EventRepository';
import { ListPaginatedEventService } from './ListPaginatedEventService';

describe('ListPaginatedEventService', () => {
  let eventRepository: jest.Mocked<EventRepository>;
  let service: ListPaginatedEventService;

  const organizationId = 'org-1';

  beforeEach(() => {
    eventRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new ListPaginatedEventService(eventRepository);
  });

  it('repassa organizationId/page/limit pro findAllPaginated', async () => {
    const paginated: PaginatedEvents = { data: [], total: 0, page: 1, limit: 10 };
    eventRepository.findAllPaginated.mockResolvedValue(paginated);

    const result = await service.execute({ organizationId, page: 1, limit: 10 });

    expect(eventRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      name: undefined,
      page: 1,
      limit: 10,
    });
    expect(result).toEqual(paginated);
  });

  it('repassa name quando informado', async () => {
    eventRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 2,
      limit: 5,
    });

    await service.execute({ organizationId, name: 'Reveillon', page: 2, limit: 5 });

    expect(eventRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      name: 'Reveillon',
      page: 2,
      limit: 5,
    });
  });

  it('usa page=1/limit=10 por padrão quando não informados', async () => {
    eventRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    await service.execute({ organizationId });

    expect(eventRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      name: undefined,
      page: 1,
      limit: 10,
    });
  });
});
