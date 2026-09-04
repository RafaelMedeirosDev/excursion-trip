import { Supplier } from '@prisma/client';
import { SupplierRepository } from 'src/domain/SupplierRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { SupplierHasUpcomingVehicleBookings } from 'src/shared/erros/cases/SupplierHasUpcomingVehicleBookings';
import { SupplierNotFound } from 'src/shared/erros/cases/SupplierNotFound';
import { DeleteSupplierService } from './DeleteSupplierService';

describe('DeleteSupplierService', () => {
  let supplierRepository: jest.Mocked<SupplierRepository>;
  let vehicleBookingRepository: jest.Mocked<VehicleBookingRepository>;
  let service: DeleteSupplierService;

  const existingSupplier = {
    id: 'supplier-1',
    organizationId: 'org-1',
    name: 'Viação Serra Azul',
    cnpj: '11222333000144',
  } as Supplier;

  const request = { organizationId: 'org-1', id: 'supplier-1' };

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
    vehicleBookingRepository = {
      create: jest.fn(),
      findByExcursionAndPlate: jest.fn(),
      countUpcomingBySupplierId: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new DeleteSupplierService(
      supplierRepository,
      vehicleBookingRepository,
    );
    supplierRepository.findById.mockResolvedValue(existingSupplier);
    vehicleBookingRepository.countUpcomingBySupplierId.mockResolvedValue(0);
  });

  it('marca o fornecedor como excluído quando não há veículo em excursão futura', async () => {
    await service.execute(request);

    expect(
      vehicleBookingRepository.countUpcomingBySupplierId,
    ).toHaveBeenCalledWith({ supplierId: 'supplier-1' });
    expect(supplierRepository.softDelete).toHaveBeenCalledWith({
      id: 'supplier-1',
    });
  });

  it('exclui mesmo com histórico de veículos em excursões já finalizadas', async () => {
    // a contagem só considera excursão não finalizada, então veículo antigo
    // não impede a exclusão
    vehicleBookingRepository.countUpcomingBySupplierId.mockResolvedValue(0);

    await service.execute(request);

    expect(supplierRepository.softDelete).toHaveBeenCalled();
  });

  it('lança SupplierHasUpcomingVehicleBookings quando há veículo em excursão que não terminou', async () => {
    vehicleBookingRepository.countUpcomingBySupplierId.mockResolvedValue(3);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      SupplierHasUpcomingVehicleBookings,
    );
    expect(supplierRepository.softDelete).not.toHaveBeenCalled();
  });

  it('lança SupplierNotFound quando o fornecedor não existe ou já foi excluído', async () => {
    supplierRepository.findById.mockResolvedValue(null);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      SupplierNotFound,
    );
    expect(supplierRepository.softDelete).not.toHaveBeenCalled();
  });

  it('lança SupplierNotFound quando o fornecedor é de outra organização', async () => {
    supplierRepository.findById.mockResolvedValue({
      ...existingSupplier,
      organizationId: 'org-2',
    } as Supplier);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      SupplierNotFound,
    );
    expect(supplierRepository.softDelete).not.toHaveBeenCalled();
  });
});
