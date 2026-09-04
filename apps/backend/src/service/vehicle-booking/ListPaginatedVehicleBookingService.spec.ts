import { Role } from '@prisma/client';
import {
  PaginatedVehicleBookings,
  VehicleBookingRepository,
} from 'src/domain/VehicleBookingRepository';
import { ListPaginatedVehicleBookingService } from './ListPaginatedVehicleBookingService';

describe('ListPaginatedVehicleBookingService', () => {
  let vehicleBookingRepository: jest.Mocked<VehicleBookingRepository>;
  let service: ListPaginatedVehicleBookingService;

  const organizationId = 'org-1';
  const userId = 'user-1';

  beforeEach(() => {
    vehicleBookingRepository = {
      create: jest.fn(),
      findByExcursionAndPlate: jest.fn(),
      countUpcomingBySupplierId: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new ListPaginatedVehicleBookingService(vehicleBookingRepository);
  });

  it('ADM não passa userId pro repository (vê tudo da organização)', async () => {
    const paginated: PaginatedVehicleBookings = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    };
    vehicleBookingRepository.findAllPaginated.mockResolvedValue(paginated);

    const result = await service.execute({
      organizationId,
      userId,
      role: Role.ADM,
      page: 1,
      limit: 10,
    });

    expect(vehicleBookingRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      userId: undefined,
      query: undefined,
      page: 1,
      limit: 10,
    });
    expect(result).toEqual(paginated);
  });

  it('EMPLOYEE passa o próprio userId pro repository (só vê os próprios)', async () => {
    vehicleBookingRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    await service.execute({
      organizationId,
      userId,
      role: Role.EMPLOYEE,
      page: 1,
      limit: 10,
    });

    expect(vehicleBookingRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      userId,
      query: undefined,
      page: 1,
      limit: 10,
    });
  });

  it('repassa query, page e limit quando informados', async () => {
    vehicleBookingRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 2,
      limit: 5,
    });

    await service.execute({
      organizationId,
      userId,
      role: Role.ADM,
      query: 'José',
      page: 2,
      limit: 5,
    });

    expect(vehicleBookingRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      userId: undefined,
      query: 'José',
      page: 2,
      limit: 5,
    });
  });

  it('usa page=1/limit=10 por padrão quando não informados', async () => {
    vehicleBookingRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    await service.execute({ organizationId, userId, role: Role.ADM });

    expect(vehicleBookingRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      userId: undefined,
      query: undefined,
      page: 1,
      limit: 10,
    });
  });
});
