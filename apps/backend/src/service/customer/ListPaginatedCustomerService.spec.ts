import {
  CustomerRepository,
  PaginatedCustomers,
} from 'src/domain/CustomerRepository';
import { ListPaginatedCustomerService } from './ListPaginatedCustomerService';

describe('ListPaginatedCustomerService', () => {
  let customerRepository: jest.Mocked<CustomerRepository>;
  let service: ListPaginatedCustomerService;

  const organizationId = 'org-1';

  beforeEach(() => {
    customerRepository = {
      create: jest.fn(),
      findByCpf: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new ListPaginatedCustomerService(customerRepository);
  });

  it('repassa organizationId/page/limit pro findAllPaginated', async () => {
    const paginated: PaginatedCustomers = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    };
    customerRepository.findAllPaginated.mockResolvedValue(paginated);

    const result = await service.execute({ organizationId, page: 1, limit: 10 });

    expect(customerRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      query: undefined,
      page: 1,
      limit: 10,
    });
    expect(result).toEqual(paginated);
  });

  it('repassa query quando informada', async () => {
    customerRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 2,
      limit: 5,
    });

    await service.execute({ organizationId, query: 'Maria', page: 2, limit: 5 });

    expect(customerRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      query: 'Maria',
      page: 2,
      limit: 5,
    });
  });

  it('usa page=1/limit=10 por padrão quando não informados', async () => {
    customerRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    await service.execute({ organizationId });

    expect(customerRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      query: undefined,
      page: 1,
      limit: 10,
    });
  });
});
