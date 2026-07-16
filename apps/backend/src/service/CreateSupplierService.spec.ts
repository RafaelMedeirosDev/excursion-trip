import { Supplier } from '@prisma/client';
import { SupplierRepository } from 'src/domain/SupplierRepository';
import { SupplierAlreadyExists } from 'src/shared/erros/cases/SupplierAlreadyExists';
import { CreateSupplierService } from './CreateSupplierService';

describe('CreateSupplierService', () => {
  let supplierRepository: jest.Mocked<SupplierRepository>;
  let service: CreateSupplierService;

  const request = {
    organizationId: 'org-1',
    name: 'Viação Estrela',
    cnpj: '12345678000100',
    phone: '4899999999',
  };

  beforeEach(() => {
    supplierRepository = {
      create: jest.fn(),
      findByCnpj: jest.fn(),
      findById: jest.fn(),
    };
    service = new CreateSupplierService(supplierRepository);
  });

  it('cria o fornecedor quando o cnpj ainda não existe na organização', async () => {
    supplierRepository.findByCnpj.mockResolvedValue(null);
    supplierRepository.create.mockResolvedValue({
      id: 'supplier-1',
    } as Supplier);

    const result = await service.execute(request);

    expect(supplierRepository.findByCnpj).toHaveBeenCalledWith({
      organizationId: request.organizationId,
      cnpj: request.cnpj,
    });
    expect(supplierRepository.create).toHaveBeenCalledWith(request);
    expect(result).toEqual({ id: 'supplier-1' });
  });

  it('lança SupplierAlreadyExists quando o cnpj já existe na organização', async () => {
    supplierRepository.findByCnpj.mockResolvedValue({
      id: 'outro',
    } as Supplier);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      SupplierAlreadyExists,
    );
    expect(supplierRepository.create).not.toHaveBeenCalled();
  });
});
