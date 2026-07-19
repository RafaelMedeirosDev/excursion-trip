import { ReservationStatus, Role } from '@prisma/client';
import {
  Reservations,
  ReservationRepository,
} from 'src/domain/ReservationRepository';
import { ListReservationService } from './ListReservationService';

describe('ListReservationService', () => {
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let service: ListReservationService;

  const organizationId = 'org-1';
  const userId = 'user-1';

  beforeEach(() => {
    reservationRepository = {
      create: jest.fn(),
      findByVehicleBookingAndCustomer: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };
    service = new ListReservationService(reservationRepository);
  });

  it('ADM: lista todas as reservas da organização, sem filtrar por userId', async () => {
    const reservations = [
      { id: 'reservation-1', organizationId },
    ] as Reservations[];
    reservationRepository.findAll.mockResolvedValue(reservations);

    const result = await service.execute({
      organizationId,
      userId,
      role: Role.ADM,
    });

    expect(reservationRepository.findAll).toHaveBeenCalledWith({
      organizationId,
      userId: undefined,
    });
    expect(result).toEqual(reservations);
  });

  it('EMPLOYEE: lista só as reservas registradas por ele (filtra por userId)', async () => {
    const reservations = [
      { id: 'reservation-1', organizationId, userId },
    ] as Reservations[];
    reservationRepository.findAll.mockResolvedValue(reservations);

    const result = await service.execute({
      organizationId,
      userId,
      role: Role.EMPLOYEE,
    });

    expect(reservationRepository.findAll).toHaveBeenCalledWith({
      organizationId,
      userId,
    });
    expect(result).toEqual(reservations);
  });

  it('ADM: repassa o status pro findAll quando informado', async () => {
    reservationRepository.findAll.mockResolvedValue([]);

    await service.execute({
      organizationId,
      userId,
      role: Role.ADM,
      status: ReservationStatus.CONFIRMED,
    });

    expect(reservationRepository.findAll).toHaveBeenCalledWith({
      organizationId,
      userId: undefined,
      status: ReservationStatus.CONFIRMED,
    });
  });

  it('EMPLOYEE: filtro de status se combina com o filtro por userId, não o substitui', async () => {
    reservationRepository.findAll.mockResolvedValue([]);

    await service.execute({
      organizationId,
      userId,
      role: Role.EMPLOYEE,
      status: ReservationStatus.WAITLIST,
    });

    expect(reservationRepository.findAll).toHaveBeenCalledWith({
      organizationId,
      userId,
      status: ReservationStatus.WAITLIST,
    });
  });
});
