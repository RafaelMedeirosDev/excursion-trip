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
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      findByCnpj: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
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

  it('restaura o fornecedor quando o cnpj pertence a um cadastro excluído', async () => {
    supplierRepository.findByCnpj.mockResolvedValue({
      id: 'supplier-antigo',
      deletedAt: new Date(),
    } as Supplier);
    supplierRepository.restore.mockResolvedValue({
      id: 'supplier-antigo',
    } as Supplier);

    const result = await service.execute(request);

    expect(supplierRepository.restore).toHaveBeenCalledWith({
      id: 'supplier-antigo',
      name: request.name,
      address: undefined,
      phone: request.phone,
    });
    expect(supplierRepository.create).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 'supplier-antigo' });
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
