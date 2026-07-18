import { Excursion, Supplier, User, VehicleBooking } from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { SupplierRepository } from 'src/domain/SupplierRepository';
import { UserRepository } from 'src/domain/UserRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { ExcursionNotFound } from 'src/shared/erros/cases/ExcursionNotFound';
import { SupplierNotFound } from 'src/shared/erros/cases/SupplierNotFound';
import { UserNotFound } from 'src/shared/erros/cases/UserNotFound';
import { VehicleBookingAlreadyExists } from 'src/shared/erros/cases/VehicleBookingAlreadyExists';
import { CreateVehicleBookingService } from './CreateVehicleBookingService';

describe('CreateVehicleBookingService', () => {
  let vehicleBookingRepository: jest.Mocked<VehicleBookingRepository>;
  let excursionRepository: jest.Mocked<ExcursionRepository>;
  let supplierRepository: jest.Mocked<SupplierRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let service: CreateVehicleBookingService;

  const organizationId = 'org-1';

  const request = {
    organizationId,
    userId: 'user-1',
    supplierId: 'supplier-1',
    excursionId: 'excursion-1',
    vehicleType: 'Ônibus',
    plate: 'ABC1D23',
    capacity: 46,
    value: 500000,
    price: 15000,
  };

  const excursion = { id: 'excursion-1', organizationId } as Excursion;
  const supplier = { id: 'supplier-1', organizationId } as Supplier;
  const user = { id: 'user-1', organizationId } as User;

  beforeEach(() => {
    vehicleBookingRepository = {
      create: jest.fn(),
      findByExcursionAndPlate: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    excursionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };
    supplierRepository = {
      create: jest.fn(),
      findByCnpj: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findByCpf: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    service = new CreateVehicleBookingService(
      vehicleBookingRepository,
      excursionRepository,
      supplierRepository,
      userRepository,
    );

    excursionRepository.findById.mockResolvedValue(excursion);
    supplierRepository.findById.mockResolvedValue(supplier);
    userRepository.findById.mockResolvedValue(user);
    vehicleBookingRepository.findByExcursionAndPlate.mockResolvedValue(null);
  });

  it('cria o vehicle booking quando excursion, supplier e user pertencem à organização e a placa é livre', async () => {
    vehicleBookingRepository.create.mockResolvedValue({
      id: 'vb-1',
    } as VehicleBooking);

    const result = await service.execute(request);

    expect(vehicleBookingRepository.findByExcursionAndPlate).toHaveBeenCalledWith(
      { excursionId: request.excursionId, plate: request.plate },
    );
    expect(vehicleBookingRepository.create).toHaveBeenCalledWith({
      organizationId,
      supplierId: request.supplierId,
      excursionId: request.excursionId,
      userId: request.userId,
      vehicleType: request.vehicleType,
      plate: request.plate,
      capacity: request.capacity,
      value: request.value,
      startTime: undefined,
      returnTime: undefined,
      price: request.price,
    });
    expect(result).toEqual({ id: 'vb-1' });
  });

  it('não checa duplicidade de placa quando plate não é informado', async () => {
    vehicleBookingRepository.create.mockResolvedValue({
      id: 'vb-1',
    } as VehicleBooking);

    await service.execute({ ...request, plate: undefined });

    expect(
      vehicleBookingRepository.findByExcursionAndPlate,
    ).not.toHaveBeenCalled();
  });

  it('lança ExcursionNotFound quando a excursion é de outra organização', async () => {
    excursionRepository.findById.mockResolvedValue({
      id: 'excursion-1',
      organizationId: 'org-2',
    } as Excursion);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      ExcursionNotFound,
    );
    expect(vehicleBookingRepository.create).not.toHaveBeenCalled();
  });

  it('lança SupplierNotFound quando o supplier não existe', async () => {
    supplierRepository.findById.mockResolvedValue(null);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      SupplierNotFound,
    );
    expect(vehicleBookingRepository.create).not.toHaveBeenCalled();
  });

  it('lança UserNotFound quando o user é de outra organização', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      organizationId: 'org-2',
    } as User);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      UserNotFound,
    );
    expect(vehicleBookingRepository.create).not.toHaveBeenCalled();
  });

  it('lança VehicleBookingAlreadyExists quando a placa já está cadastrada na excursão', async () => {
    vehicleBookingRepository.findByExcursionAndPlate.mockResolvedValue({
      id: 'vb-existente',
    } as VehicleBooking);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      VehicleBookingAlreadyExists,
    );
    expect(vehicleBookingRepository.create).not.toHaveBeenCalled();
  });
});
