import {
  BoardingPoint,
  Customer,
  Excursion,
  ExcursionStatus,
  Reservation,
  VehicleBooking,
} from '@prisma/client';
import { BoardingPointRepository } from 'src/domain/BoardingPointRepository';
import { CustomerRepository } from 'src/domain/CustomerRepository';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { BoardingPointNotFound } from 'src/shared/erros/cases/BoardingPointNotFound';
import { CustomerNotFound } from 'src/shared/erros/cases/CustomerNotFound';
import { ReservationAlreadyExists } from 'src/shared/erros/cases/ReservationAlreadyExists';
import { ReservationExcursionNotAvailable } from 'src/shared/erros/cases/ReservationExcursionNotAvailable';
import { VehicleBookingNotFound } from 'src/shared/erros/cases/VehicleBookingNotFound';
import { CreateReservationService } from './CreateReservationService';

describe('CreateReservationService', () => {
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let customerRepository: jest.Mocked<CustomerRepository>;
  let vehicleBookingRepository: jest.Mocked<VehicleBookingRepository>;
  let boardingPointRepository: jest.Mocked<BoardingPointRepository>;
  let excursionRepository: jest.Mocked<ExcursionRepository>;
  let service: CreateReservationService;

  const organizationId = 'org-1';

  const request = {
    organizationId,
    userId: 'user-1',
    customerId: 'customer-1',
    vehicleBookingId: 'vb-1',
    agreedValue: 15000,
  };

  beforeEach(() => {
    reservationRepository = {
      create: jest.fn(),
      findByVehicleBookingAndCustomer: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    customerRepository = {
      create: jest.fn(),
      findByCpf: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    vehicleBookingRepository = {
      create: jest.fn(),
      findByExcursionAndPlate: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    boardingPointRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    excursionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };
    service = new CreateReservationService(
      reservationRepository,
      customerRepository,
      vehicleBookingRepository,
      boardingPointRepository,
      excursionRepository,
    );

    customerRepository.findById.mockResolvedValue({
      id: 'customer-1',
      organizationId,
    } as Customer);
    vehicleBookingRepository.findById.mockResolvedValue({
      id: 'vb-1',
      organizationId,
      excursionId: 'excursion-1',
    } as VehicleBooking);
    excursionRepository.findById.mockResolvedValue({
      id: 'excursion-1',
      organizationId,
      status: ExcursionStatus.OPEN,
    } as Excursion);
    reservationRepository.findByVehicleBookingAndCustomer.mockResolvedValue(
      null,
    );
  });

  it('cria a reserva sem boardingPointId', async () => {
    reservationRepository.create.mockResolvedValue({
      id: 'reservation-1',
    } as Reservation);

    const result = await service.execute(request);

    expect(boardingPointRepository.findById).not.toHaveBeenCalled();
    expect(reservationRepository.create).toHaveBeenCalledWith({
      ...request,
      boardingPointId: undefined,
    });
    expect(result).toEqual({ id: 'reservation-1' });
  });

  it('cria a reserva com boardingPointId pertencente ao mesmo vehicleBooking', async () => {
    boardingPointRepository.findById.mockResolvedValue({
      id: 'bp-1',
      organizationId,
      vehicleBookingId: 'vb-1',
    } as BoardingPoint);
    reservationRepository.create.mockResolvedValue({
      id: 'reservation-1',
    } as Reservation);

    await service.execute({ ...request, boardingPointId: 'bp-1' });

    expect(reservationRepository.create).toHaveBeenCalledWith({
      ...request,
      boardingPointId: 'bp-1',
    });
  });

  it('lança CustomerNotFound quando o customer é de outra organização', async () => {
    customerRepository.findById.mockResolvedValue({
      id: 'customer-1',
      organizationId: 'org-2',
    } as Customer);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      CustomerNotFound,
    );
    expect(reservationRepository.create).not.toHaveBeenCalled();
  });

  it('lança VehicleBookingNotFound quando o vehicleBooking não existe', async () => {
    vehicleBookingRepository.findById.mockResolvedValue(null);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      VehicleBookingNotFound,
    );
    expect(reservationRepository.create).not.toHaveBeenCalled();
  });

  it('lança BoardingPointNotFound quando o boardingPointId não existe', async () => {
    boardingPointRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ ...request, boardingPointId: 'bp-1' }),
    ).rejects.toBeInstanceOf(BoardingPointNotFound);
    expect(reservationRepository.create).not.toHaveBeenCalled();
  });

  it('lança BoardingPointNotFound quando o boardingPoint é de outro vehicleBooking', async () => {
    boardingPointRepository.findById.mockResolvedValue({
      id: 'bp-1',
      organizationId,
      vehicleBookingId: 'vb-outro',
    } as BoardingPoint);

    await expect(
      service.execute({ ...request, boardingPointId: 'bp-1' }),
    ).rejects.toBeInstanceOf(BoardingPointNotFound);
    expect(reservationRepository.create).not.toHaveBeenCalled();
  });

  it('lança ReservationAlreadyExists quando o cliente já tem reserva nesse vehicleBooking', async () => {
    reservationRepository.findByVehicleBookingAndCustomer.mockResolvedValue({
      id: 'reservation-existente',
    } as Reservation);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      ReservationAlreadyExists,
    );
    expect(reservationRepository.create).not.toHaveBeenCalled();
  });

  it('lança ReservationExcursionNotAvailable quando a excursion não está em PLANNING nem OPEN', async () => {
    excursionRepository.findById.mockResolvedValue({
      id: 'excursion-1',
      organizationId,
      status: ExcursionStatus.CLOSED,
    } as Excursion);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      ReservationExcursionNotAvailable,
    );
    expect(reservationRepository.create).not.toHaveBeenCalled();
  });
});
