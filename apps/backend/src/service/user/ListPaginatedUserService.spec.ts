import { PaginatedUsers, UserRepository } from 'src/domain/UserRepository';
import { ListPaginatedUserService } from './ListPaginatedUserService';

describe('ListPaginatedUserService', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let service: ListPaginatedUserService;

  const organizationId = 'org-1';

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findByCpf: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new ListPaginatedUserService(userRepository);
  });

  it('repassa query, page e limit quando informados', async () => {
    const paginated: PaginatedUsers = {
      data: [],
      total: 0,
      page: 2,
      limit: 5,
    };
    userRepository.findAllPaginated.mockResolvedValue(paginated);

    const result = await service.execute({
      organizationId,
      query: 'José',
      page: 2,
      limit: 5,
    });

    expect(userRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      query: 'José',
      page: 2,
      limit: 5,
    });
    expect(result).toEqual(paginated);
  });

  it('usa page=1/limit=10 por padrão quando não informados', async () => {
    userRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    await service.execute({ organizationId });

    expect(userRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      query: undefined,
      page: 1,
      limit: 10,
    });
  });
});
