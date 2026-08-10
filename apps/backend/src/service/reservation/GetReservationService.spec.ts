import { Reservation, Role, VehicleBooking } from '@prisma/client';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { ReservationNotFound } from 'src/shared/erros/cases/ReservationNotFound';
import { GetReservationService } from './GetReservationService';

describe('GetReservationService', () => {
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let vehicleBookingRepository: jest.Mocked<VehicleBookingRepository>;
  let service: GetReservationService;

  const organizationId = 'org-1';
  const userId = 'user-1';
  const reservation = {
    id: 'reservation-1',
    organizationId,
    userId,
    vehicleBookingId: 'vb-1',
  } as Reservation;

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
    vehicleBookingRepository = {
      create: jest.fn(),
      findByExcursionAndPlate: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new GetReservationService(
      reservationRepository,
      vehicleBookingRepository,
    );
  });

  it('ADM: retorna a reservation mesmo não sendo o próprio userId', async () => {
    reservationRepository.findById.mockResolvedValue(reservation);

    const result = await service.execute({
      organizationId,
      id: 'reservation-1',
      userId: 'outro-user',
      role: Role.ADM,
    });

    expect(result).toEqual(reservation);
  });

  it('EMPLOYEE: retorna a reservation quando é o dono', async () => {
    reservationRepository.findById.mockResolvedValue(reservation);

    const result = await service.execute({
      organizationId,
      id: 'reservation-1',
      userId,
      role: Role.EMPLOYEE,
    });

    expect(result).toEqual(reservation);
  });

  it('EMPLOYEE: retorna a reservation quando é o responsável pelo vehicleBooking, mesmo sem ter registrado', async () => {
    reservationRepository.findById.mockResolvedValue(reservation);
    vehicleBookingRepository.findById.mockResolvedValue({
      id: 'vb-1',
      organizationId,
      userId: 'outro-user',
    } as VehicleBooking);

    const result = await service.execute({
      organizationId,
      id: 'reservation-1',
      userId: 'outro-user',
      role: Role.EMPLOYEE,
    });

    expect(result).toEqual(reservation);
  });

  it('EMPLOYEE: lança ReservationNotFound quando nem registrou nem é responsável pelo vehicleBooking', async () => {
    reservationRepository.findById.mockResolvedValue(reservation);
    vehicleBookingRepository.findById.mockResolvedValue({
      id: 'vb-1',
      organizationId,
      userId: 'outro-user',
    } as VehicleBooking);

    await expect(
      service.execute({
        organizationId,
        id: 'reservation-1',
        userId: 'terceiro-user',
        role: Role.EMPLOYEE,
      }),
    ).rejects.toBeInstanceOf(ReservationNotFound);
  });

  it('lança ReservationNotFound quando a reservation não existe', async () => {
    reservationRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({
        organizationId,
        id: 'reservation-1',
        userId,
        role: Role.ADM,
      }),
    ).rejects.toBeInstanceOf(ReservationNotFound);
  });

  it('lança ReservationNotFound quando a reservation é de outra organização', async () => {
    reservationRepository.findById.mockResolvedValue({
      ...reservation,
      organizationId: 'org-2',
    });

    await expect(
      service.execute({
        organizationId,
        id: 'reservation-1',
        userId,
        role: Role.ADM,
      }),
    ).rejects.toBeInstanceOf(ReservationNotFound);
  });
});
