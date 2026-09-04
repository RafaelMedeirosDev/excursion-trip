import {
  PaginatedSuppliers,
  SupplierRepository,
} from 'src/domain/SupplierRepository';
import { ListPaginatedSupplierService } from './ListPaginatedSupplierService';

describe('ListPaginatedSupplierService', () => {
  let supplierRepository: jest.Mocked<SupplierRepository>;
  let service: ListPaginatedSupplierService;

  const organizationId = 'org-1';

  beforeEach(() => {
    supplierRepository = {
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      findByCnpj: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new ListPaginatedSupplierService(supplierRepository);
  });

  it('repassa organizationId/page/limit pro findAllPaginated', async () => {
    const paginated: PaginatedSuppliers = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    };
    supplierRepository.findAllPaginated.mockResolvedValue(paginated);

    const result = await service.execute({ organizationId, page: 1, limit: 10 });

    expect(supplierRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      query: undefined,
      page: 1,
      limit: 10,
    });
    expect(result).toEqual(paginated);
  });

  it('repassa query quando informada', async () => {
    supplierRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 2,
      limit: 5,
    });

    await service.execute({ organizationId, query: 'Zezinho', page: 2, limit: 5 });

    expect(supplierRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      query: 'Zezinho',
      page: 2,
      limit: 5,
    });
  });

  it('usa page=1/limit=10 por padrão quando não informados', async () => {
    supplierRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    await service.execute({ organizationId });

    expect(supplierRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      query: undefined,
      page: 1,
      limit: 10,
    });
  });
});
