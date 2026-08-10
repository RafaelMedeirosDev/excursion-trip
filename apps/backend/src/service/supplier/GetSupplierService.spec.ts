import { Supplier } from '@prisma/client';
import { SupplierRepository } from 'src/domain/SupplierRepository';
import { SupplierNotFound } from 'src/shared/erros/cases/SupplierNotFound';
import { GetSupplierService } from './GetSupplierService';

describe('GetSupplierService', () => {
  let supplierRepository: jest.Mocked<SupplierRepository>;
  let service: GetSupplierService;

  const organizationId = 'org-1';
  const supplier = { id: 'supplier-1', organizationId } as Supplier;

  beforeEach(() => {
    supplierRepository = {
      create: jest.fn(),
      findByCnpj: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new GetSupplierService(supplierRepository);
  });

  it('retorna o supplier quando pertence à organização', async () => {
    supplierRepository.findById.mockResolvedValue(supplier);

    const result = await service.execute({
      organizationId,
      id: 'supplier-1',
    });

    expect(result).toEqual(supplier);
  });

  it('lança SupplierNotFound quando o supplier não existe', async () => {
    supplierRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ organizationId, id: 'supplier-1' }),
    ).rejects.toBeInstanceOf(SupplierNotFound);
  });

  it('lança SupplierNotFound quando o supplier é de outra organização', async () => {
    supplierRepository.findById.mockResolvedValue({
      ...supplier,
      organizationId: 'org-2',
    });

    await expect(
      service.execute({ organizationId, id: 'supplier-1' }),
    ).rejects.toBeInstanceOf(SupplierNotFound);
  });
});
