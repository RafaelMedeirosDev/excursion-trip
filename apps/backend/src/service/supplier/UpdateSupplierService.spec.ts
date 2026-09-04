import { Supplier } from '@prisma/client';
import { SupplierRepository } from 'src/domain/SupplierRepository';
import { SupplierAlreadyExists } from 'src/shared/erros/cases/SupplierAlreadyExists';
import { SupplierNotFound } from 'src/shared/erros/cases/SupplierNotFound';
import { UpdateSupplierService } from './UpdateSupplierService';

describe('UpdateSupplierService', () => {
  let supplierRepository: jest.Mocked<SupplierRepository>;
  let service: UpdateSupplierService;

  const existingSupplier = {
    id: 'supplier-1',
    organizationId: 'org-1',
    name: 'Viação Serra Azul',
    cnpj: '11222333000144',
    address: 'Av. das Palmeiras, 1200',
    phone: '1133220001',
  } as Supplier;

  const request = { organizationId: 'org-1', id: 'supplier-1' };

  beforeEach(() => {
    supplierRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findByCnpj: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new UpdateSupplierService(supplierRepository);
    supplierRepository.findById.mockResolvedValue(existingSupplier);
    supplierRepository.update.mockResolvedValue({
      id: 'supplier-1',
    } as Supplier);
  });

  it('atualiza somente os campos informados', async () => {
    const result = await service.execute({ ...request, phone: '1199999999' });

    expect(supplierRepository.update).toHaveBeenCalledWith({
      id: 'supplier-1',
      name: undefined,
      cnpj: undefined,
      address: undefined,
      phone: '1199999999',
    });
    expect(result).toEqual({ id: 'supplier-1' });
  });

  it('repassa address null para limpar o endereço cadastrado', async () => {
    await service.execute({ ...request, address: null });

    expect(supplierRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ address: null }),
    );
  });

  it('lança SupplierNotFound quando o fornecedor não existe', async () => {
    supplierRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ ...request, name: 'Novo' }),
    ).rejects.toBeInstanceOf(SupplierNotFound);
    expect(supplierRepository.update).not.toHaveBeenCalled();
  });

  it('lança SupplierNotFound quando o fornecedor é de outra organização', async () => {
    supplierRepository.findById.mockResolvedValue({
      ...existingSupplier,
      organizationId: 'org-2',
    } as Supplier);

    await expect(
      service.execute({ ...request, name: 'Novo' }),
    ).rejects.toBeInstanceOf(SupplierNotFound);
    expect(supplierRepository.update).not.toHaveBeenCalled();
  });

  it('lança SupplierAlreadyExists quando o cnpj novo é de outro fornecedor', async () => {
    supplierRepository.findByCnpj.mockResolvedValue({
      id: 'outro',
    } as Supplier);

    await expect(
      service.execute({ ...request, cnpj: '99999999000199' }),
    ).rejects.toBeInstanceOf(SupplierAlreadyExists);
    expect(supplierRepository.update).not.toHaveBeenCalled();
  });

  it('não checa duplicidade quando o cnpj é o mesmo do próprio fornecedor', async () => {
    await service.execute({ ...request, cnpj: existingSupplier.cnpj });

    expect(supplierRepository.findByCnpj).not.toHaveBeenCalled();
    expect(supplierRepository.update).toHaveBeenCalled();
  });
});
