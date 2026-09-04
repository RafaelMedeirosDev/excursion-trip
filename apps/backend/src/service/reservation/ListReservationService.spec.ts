import { ReservationStatus, Role, VehicleBooking } from '@prisma/client';
import {
  Reservations,
  ReservationRepository,
} from 'src/domain/ReservationRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { VehicleBookingNotFound } from 'src/shared/erros/cases/VehicleBookingNotFound';
import { ListReservationService } from './ListReservationService';

describe('ListReservationService', () => {
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let vehicleBookingRepository: jest.Mocked<VehicleBookingRepository>;
  let service: ListReservationService;

  const organizationId = 'org-1';
  const userId = 'user-1';

  beforeEach(() => {
    reservationRepository = {
      create: jest.fn(),
      findActiveByEventAndCustomer: jest.fn(),
      findById: jest.fn(),
      countActiveByVehicleBookingId: jest.fn(),
      countUpcomingByCustomerId: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      updateStatus: jest.fn(),
    };
    vehicleBookingRepository = {
      create: jest.fn(),
      findByExcursionAndPlate: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new ListReservationService(
      reservationRepository,
      vehicleBookingRepository,
    );
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

  it('ADM: com vehicleBookingId, lista todas as reservas do veículo, sem filtrar por userId', async () => {
    vehicleBookingRepository.findById.mockResolvedValue({
      id: 'vb-1',
      organizationId,
      userId: 'outro-user',
    } as VehicleBooking);
    reservationRepository.findAll.mockResolvedValue([]);

    await service.execute({
      organizationId,
      userId,
      role: Role.ADM,
      vehicleBookingId: 'vb-1',
    });

    expect(reservationRepository.findAll).toHaveBeenCalledWith({
      organizationId,
      status: undefined,
      vehicleBookingId: 'vb-1',
    });
  });

  it('EMPLOYEE dono do veículo: com vehicleBookingId, lista todas as reservas do veículo (não só as dele)', async () => {
    vehicleBookingRepository.findById.mockResolvedValue({
      id: 'vb-1',
      organizationId,
      userId,
    } as VehicleBooking);
    reservationRepository.findAll.mockResolvedValue([]);

    await service.execute({
      organizationId,
      userId,
      role: Role.EMPLOYEE,
      vehicleBookingId: 'vb-1',
    });

    expect(reservationRepository.findAll).toHaveBeenCalledWith({
      organizationId,
      status: undefined,
      vehicleBookingId: 'vb-1',
    });
  });

  it('EMPLOYEE que não é o responsável: lança VehicleBookingNotFound', async () => {
    vehicleBookingRepository.findById.mockResolvedValue({
      id: 'vb-1',
      organizationId,
      userId: 'outro-user',
    } as VehicleBooking);

    await expect(
      service.execute({
        organizationId,
        userId,
        role: Role.EMPLOYEE,
        vehicleBookingId: 'vb-1',
      }),
    ).rejects.toBeInstanceOf(VehicleBookingNotFound);
    expect(reservationRepository.findAll).not.toHaveBeenCalled();
  });

  it('vehicleBookingId de outra organização: lança VehicleBookingNotFound', async () => {
    vehicleBookingRepository.findById.mockResolvedValue({
      id: 'vb-1',
      organizationId: 'org-2',
      userId,
    } as VehicleBooking);

    await expect(
      service.execute({
        organizationId,
        userId,
        role: Role.ADM,
        vehicleBookingId: 'vb-1',
      }),
    ).rejects.toBeInstanceOf(VehicleBookingNotFound);
  });

  it('vehicleBookingId inexistente: lança VehicleBookingNotFound', async () => {
    vehicleBookingRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({
        organizationId,
        userId,
        role: Role.ADM,
        vehicleBookingId: 'vb-1',
      }),
    ).rejects.toBeInstanceOf(VehicleBookingNotFound);
  });
});
