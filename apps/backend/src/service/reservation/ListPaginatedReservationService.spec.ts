import { ReservationStatus, Role } from '@prisma/client';
import {
  PaginatedReservations,
  ReservationRepository,
} from 'src/domain/ReservationRepository';
import { ListPaginatedReservationService } from './ListPaginatedReservationService';

describe('ListPaginatedReservationService', () => {
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let service: ListPaginatedReservationService;

  const organizationId = 'org-1';
  const userId = 'user-1';

  beforeEach(() => {
    reservationRepository = {
      create: jest.fn(),
      findActiveByEventAndCustomer: jest.fn(),
      findById: jest.fn(),
      countActiveByVehicleBookingId: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      updateStatus: jest.fn(),
    };
    service = new ListPaginatedReservationService(reservationRepository);
  });

  it('ADM não passa userId pro repository (vê tudo da organização)', async () => {
    const paginated: PaginatedReservations = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    };
    reservationRepository.findAllPaginated.mockResolvedValue(paginated);

    const result = await service.execute({
      organizationId,
      userId,
      role: Role.ADM,
      page: 1,
      limit: 10,
    });

    expect(reservationRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      userId: undefined,
      status: undefined,
      eventName: undefined,
      page: 1,
      limit: 10,
    });
    expect(result).toEqual(paginated);
  });

  it('EMPLOYEE passa o próprio userId pro repository (só vê as próprias)', async () => {
    reservationRepository.findAllPaginated.mockResolvedValue({
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

    expect(reservationRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      userId,
      status: undefined,
      eventName: undefined,
      page: 1,
      limit: 10,
    });
  });

  it('repassa status, eventName, page e limit quando informados', async () => {
    reservationRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 2,
      limit: 5,
    });

    await service.execute({
      organizationId,
      userId,
      role: Role.ADM,
      status: ReservationStatus.CONFIRMED,
      eventName: 'Reveillon',
      page: 2,
      limit: 5,
    });

    expect(reservationRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      userId: undefined,
      status: ReservationStatus.CONFIRMED,
      eventName: 'Reveillon',
      page: 2,
      limit: 5,
    });
  });
});
