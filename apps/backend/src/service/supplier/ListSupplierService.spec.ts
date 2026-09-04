import { SupplierRepository, Suppliers } from 'src/domain/SupplierRepository';
import { ListSupplierService } from './ListSupplierService';

describe('ListSupplierService', () => {
  let supplierRepository: jest.Mocked<SupplierRepository>;
  let service: ListSupplierService;

  const organizationId = 'org-1';

  beforeEach(() => {
    supplierRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findByCnpj: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new ListSupplierService(supplierRepository);
  });

  it('lista os suppliers da organização informada', async () => {
    const suppliers = [{ id: 'supplier-1', organizationId }] as Suppliers[];
    supplierRepository.findAll.mockResolvedValue(suppliers);

    const result = await service.execute({ organizationId });

    expect(supplierRepository.findAll).toHaveBeenCalledWith({
      organizationId,
    });
    expect(result).toEqual(suppliers);
  });
});
