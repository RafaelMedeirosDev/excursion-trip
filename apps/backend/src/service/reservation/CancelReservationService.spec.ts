import {
  Excursion,
  ExcursionStatus,
  Reservation,
  ReservationStatus,
  Role,
  VehicleBooking,
} from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { InvalidReservationStatusTransition } from 'src/shared/erros/cases/InvalidReservationStatusTransition';
import { ReservationExcursionNotAvailableForStatusChange } from 'src/shared/erros/cases/ReservationExcursionNotAvailableForStatusChange';
import { ReservationNotFound } from 'src/shared/erros/cases/ReservationNotFound';
import { CancelReservationService } from './CancelReservationService';

describe('CancelReservationService', () => {
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let vehicleBookingRepository: jest.Mocked<VehicleBookingRepository>;
  let excursionRepository: jest.Mocked<ExcursionRepository>;
  let service: CancelReservationService;

  const organizationId = 'org-1';

  const request = {
    organizationId,
    userId: 'user-1',
    role: Role.ADM,
    id: 'reservation-1',
    cancelReason: 'Cliente desistiu',
  };

  const reservation = {
    id: 'reservation-1',
    organizationId,
    userId: 'user-1',
    vehicleBookingId: 'vb-1',
    status: ReservationStatus.WAITLIST,
  } as Reservation;

  const vehicleBooking = {
    id: 'vb-1',
    organizationId,
    excursionId: 'excursion-1',
  } as VehicleBooking;

  const excursion = {
    id: 'excursion-1',
    organizationId,
    status: ExcursionStatus.OPEN,
  } as Excursion;

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
    excursionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      updateStatus: jest.fn(),
    };
    service = new CancelReservationService(
      reservationRepository,
      vehicleBookingRepository,
      excursionRepository,
    );

    reservationRepository.findById.mockResolvedValue(reservation);
    vehicleBookingRepository.findById.mockResolvedValue(vehicleBooking);
    excursionRepository.findById.mockResolvedValue(excursion);
  });

  it('cancela a reservation a partir de WAITLIST', async () => {
    reservationRepository.updateStatus.mockResolvedValue({
      ...reservation,
      status: ReservationStatus.CANCELED,
      canceledAt: new Date(),
      cancelReason: request.cancelReason,
    });

    const result = await service.execute(request);

    expect(reservationRepository.updateStatus).toHaveBeenCalledWith({
      id: 'reservation-1',
      status: ReservationStatus.CANCELED,
      canceledAt: expect.any(Date),
      cancelReason: 'Cliente desistiu',
    });
    expect(result.status).toBe(ReservationStatus.CANCELED);
  });

  it('cancela a reservation a partir de CONFIRMED', async () => {
    reservationRepository.findById.mockResolvedValue({
      ...reservation,
      status: ReservationStatus.CONFIRMED,
    });
    reservationRepository.updateStatus.mockResolvedValue({
      ...reservation,
      status: ReservationStatus.CANCELED,
    });

    await service.execute(request);

    expect(reservationRepository.updateStatus).toHaveBeenCalled();
  });

  it('lança ReservationNotFound quando a reservation é de outra organização', async () => {
    reservationRepository.findById.mockResolvedValue({
      ...reservation,
      organizationId: 'org-2',
    });

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      ReservationNotFound,
    );
    expect(reservationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('lança ReservationNotFound quando EMPLOYEE tenta cancelar reservation de outro usuário', async () => {
    await expect(
      service.execute({ ...request, role: Role.EMPLOYEE, userId: 'user-2' }),
    ).rejects.toBeInstanceOf(ReservationNotFound);
    expect(reservationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('EMPLOYEE responsável pelo vehicleBooking consegue cancelar mesmo sem ter registrado', async () => {
    vehicleBookingRepository.findById.mockResolvedValue({
      ...vehicleBooking,
      userId: 'user-2',
    });
    reservationRepository.updateStatus.mockResolvedValue({
      ...reservation,
      status: ReservationStatus.CANCELED,
    });

    await service.execute({ ...request, role: Role.EMPLOYEE, userId: 'user-2' });

    expect(reservationRepository.updateStatus).toHaveBeenCalled();
  });

  it('lança InvalidReservationStatusTransition quando a reservation já está CANCELED', async () => {
    reservationRepository.findById.mockResolvedValue({
      ...reservation,
      status: ReservationStatus.CANCELED,
    });

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      InvalidReservationStatusTransition,
    );
    expect(reservationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('lança ReservationExcursionNotAvailableForStatusChange quando a excursion está DONE', async () => {
    excursionRepository.findById.mockResolvedValue({
      ...excursion,
      status: ExcursionStatus.DONE,
    });

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      ReservationExcursionNotAvailableForStatusChange,
    );
    expect(reservationRepository.updateStatus).not.toHaveBeenCalled();
  });
});
