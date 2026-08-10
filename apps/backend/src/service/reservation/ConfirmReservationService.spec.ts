import {
  Excursion,
  ExcursionStatus,
  Payment,
  PaymentType,
  Reservation,
  ReservationStatus,
  Role,
  VehicleBooking,
} from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { PaymentRepository } from 'src/domain/PaymentRepository';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { InvalidReservationStatusTransition } from 'src/shared/erros/cases/InvalidReservationStatusTransition';
import { ReservationExcursionNotAvailableForStatusChange } from 'src/shared/erros/cases/ReservationExcursionNotAvailableForStatusChange';
import { ReservationInsufficientPaymentForConfirm } from 'src/shared/erros/cases/ReservationInsufficientPaymentForConfirm';
import { ReservationNotFound } from 'src/shared/erros/cases/ReservationNotFound';
import { VehicleBookingCapacityExceeded } from 'src/shared/erros/cases/VehicleBookingCapacityExceeded';
import { ConfirmReservationService } from './ConfirmReservationService';

describe('ConfirmReservationService', () => {
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let vehicleBookingRepository: jest.Mocked<VehicleBookingRepository>;
  let excursionRepository: jest.Mocked<ExcursionRepository>;
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let service: ConfirmReservationService;

  const organizationId = 'org-1';

  const request = {
    organizationId,
    userId: 'user-1',
    role: Role.ADM,
    id: 'reservation-1',
  };

  const reservation = {
    id: 'reservation-1',
    organizationId,
    userId: 'user-1',
    vehicleBookingId: 'vb-1',
    status: ReservationStatus.PENDING,
    agreedValue: 10000,
  } as Reservation;

  const vehicleBooking = {
    id: 'vb-1',
    organizationId,
    excursionId: 'excursion-1',
    capacity: 10,
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
      updateStatus: jest.fn(),
    };
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
      findAllPaginated: jest.fn(),
      updateStatus: jest.fn(),
    };
    paymentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByReservationId: jest.fn(),
    };
    service = new ConfirmReservationService(
      reservationRepository,
      vehicleBookingRepository,
      excursionRepository,
      paymentRepository,
    );

    reservationRepository.findById.mockResolvedValue(reservation);
    vehicleBookingRepository.findById.mockResolvedValue(vehicleBooking);
    excursionRepository.findById.mockResolvedValue(excursion);
    paymentRepository.findByReservationId.mockResolvedValue([
      { type: PaymentType.PAYMENT, value: 10000 } as Payment,
    ]);
    reservationRepository.countActiveByVehicleBookingId.mockResolvedValue(0);
  });

  it('move a reservation pra CONFIRMED a partir de PENDING quando pago 100%', async () => {
    reservationRepository.updateStatus.mockResolvedValue({
      ...reservation,
      status: ReservationStatus.CONFIRMED,
    });

    const result = await service.execute(request);

    expect(reservationRepository.updateStatus).toHaveBeenCalledWith({
      id: 'reservation-1',
      status: ReservationStatus.CONFIRMED,
    });
    expect(result.status).toBe(ReservationStatus.CONFIRMED);
  });

  it('permite pular PENDING e confirmar direto de WAITLIST se pago 100%', async () => {
    reservationRepository.findById.mockResolvedValue({
      ...reservation,
      status: ReservationStatus.WAITLIST,
    });
    reservationRepository.updateStatus.mockResolvedValue({
      ...reservation,
      status: ReservationStatus.CONFIRMED,
    });

    await service.execute(request);

    expect(reservationRepository.updateStatus).toHaveBeenCalledWith({
      id: 'reservation-1',
      status: ReservationStatus.CONFIRMED,
    });
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

  it('lança ReservationNotFound quando EMPLOYEE tenta mudar reservation de outro usuário', async () => {
    await expect(
      service.execute({ ...request, role: Role.EMPLOYEE, userId: 'user-2' }),
    ).rejects.toBeInstanceOf(ReservationNotFound);
    expect(reservationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('EMPLOYEE responsável pelo vehicleBooking consegue confirmar mesmo sem ter registrado', async () => {
    vehicleBookingRepository.findById.mockResolvedValue({
      ...vehicleBooking,
      userId: 'user-2',
    });
    reservationRepository.updateStatus.mockResolvedValue({
      ...reservation,
      status: ReservationStatus.CONFIRMED,
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

  it('lança ReservationExcursionNotAvailableForStatusChange quando a excursion está CANCELED', async () => {
    excursionRepository.findById.mockResolvedValue({
      ...excursion,
      status: ExcursionStatus.CANCELED,
    });

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      ReservationExcursionNotAvailableForStatusChange,
    );
    expect(reservationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('lança ReservationInsufficientPaymentForConfirm quando pago < 100% do agreedValue', async () => {
    paymentRepository.findByReservationId.mockResolvedValue([
      { type: PaymentType.PAYMENT, value: 5000 } as Payment,
    ]);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      ReservationInsufficientPaymentForConfirm,
    );
    expect(reservationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('lança VehicleBookingCapacityExceeded ao confirmar direto de WAITLIST num veículo lotado', async () => {
    reservationRepository.findById.mockResolvedValue({
      ...reservation,
      status: ReservationStatus.WAITLIST,
    });
    reservationRepository.countActiveByVehicleBookingId.mockResolvedValue(10);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      VehicleBookingCapacityExceeded,
    );
    expect(reservationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('confirma normalmente a partir de PENDING mesmo com o veículo "lotado" (já ocupava vaga)', async () => {
    reservationRepository.countActiveByVehicleBookingId.mockResolvedValue(10);
    reservationRepository.updateStatus.mockResolvedValue({
      ...reservation,
      status: ReservationStatus.CONFIRMED,
    });

    await service.execute(request);

    expect(
      reservationRepository.countActiveByVehicleBookingId,
    ).not.toHaveBeenCalled();
    expect(reservationRepository.updateStatus).toHaveBeenCalledWith({
      id: 'reservation-1',
      status: ReservationStatus.CONFIRMED,
    });
  });
});
