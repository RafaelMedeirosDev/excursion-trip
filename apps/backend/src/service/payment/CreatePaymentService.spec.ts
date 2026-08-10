import {
  Excursion,
  ExcursionStatus,
  Payment,
  PaymentMethod,
  PaymentType,
  Reservation,
  ReservationStatus,
  VehicleBooking,
} from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { PaymentRepository } from 'src/domain/PaymentRepository';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { ReservationNotFound } from 'src/shared/erros/cases/ReservationNotFound';
import { CreatePaymentService } from './CreatePaymentService';

describe('CreatePaymentService', () => {
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let vehicleBookingRepository: jest.Mocked<VehicleBookingRepository>;
  let excursionRepository: jest.Mocked<ExcursionRepository>;
  let service: CreatePaymentService;

  const organizationId = 'org-1';

  const baseRequest = {
    organizationId,
    userId: 'user-1',
    reservationId: 'reservation-1',
    value: 5000,
    method: PaymentMethod.PIX,
  };

  const reservation = {
    id: 'reservation-1',
    organizationId,
    vehicleBookingId: 'vb-1',
    agreedValue: 10000,
    status: ReservationStatus.WAITLIST,
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
    paymentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByReservationId: jest.fn(),
    };
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
    };
    excursionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      updateStatus: jest.fn(),
    };
    service = new CreatePaymentService(
      paymentRepository,
      reservationRepository,
      vehicleBookingRepository,
      excursionRepository,
    );

    reservationRepository.findById.mockResolvedValue(reservation);
    vehicleBookingRepository.findById.mockResolvedValue(vehicleBooking);
    excursionRepository.findById.mockResolvedValue(excursion);
    paymentRepository.findByReservationId.mockResolvedValue([]);
    reservationRepository.countActiveByVehicleBookingId.mockResolvedValue(0);
    paymentRepository.create.mockResolvedValue({ id: 'payment-1' } as Payment);
  });

  it('cria o pagamento quando type é PAYMENT', async () => {
    const result = await service.execute({
      ...baseRequest,
      type: PaymentType.PAYMENT,
    });

    expect(paymentRepository.create).toHaveBeenCalledWith({
      ...baseRequest,
      type: PaymentType.PAYMENT,
    });
    expect(result).toEqual({ id: 'payment-1' });
  });

  it('cria o pagamento quando type é REVERSAL', async () => {
    await service.execute({ ...baseRequest, type: PaymentType.REVERSAL });

    expect(paymentRepository.create).toHaveBeenCalledWith({
      ...baseRequest,
      type: PaymentType.REVERSAL,
    });
  });

  it('lança ReservationNotFound quando a reserva é de outra organização', async () => {
    reservationRepository.findById.mockResolvedValue({
      ...reservation,
      organizationId: 'org-2',
    });

    await expect(
      service.execute({ ...baseRequest, type: PaymentType.PAYMENT }),
    ).rejects.toBeInstanceOf(ReservationNotFound);
    expect(paymentRepository.create).not.toHaveBeenCalled();
  });

  it('lança ReservationNotFound quando a reserva não existe', async () => {
    reservationRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ ...baseRequest, type: PaymentType.PAYMENT }),
    ).rejects.toBeInstanceOf(ReservationNotFound);
    expect(paymentRepository.create).not.toHaveBeenCalled();
  });

  it('sobe a reservation de WAITLIST pra PENDING quando o total pago atinge 50% do agreedValue', async () => {
    paymentRepository.findByReservationId.mockResolvedValue([
      { type: PaymentType.PAYMENT, value: 5000 } as Payment,
    ]);

    await service.execute({ ...baseRequest, type: PaymentType.PAYMENT });

    expect(reservationRepository.updateStatus).toHaveBeenCalledWith({
      id: 'reservation-1',
      status: ReservationStatus.PENDING,
    });
  });

  it('sobe de PENDING pra CONFIRMED com um pagamento complementar que fecha 100% (cenário de dois pagamentos de 50%)', async () => {
    reservationRepository.findById.mockResolvedValue({
      ...reservation,
      status: ReservationStatus.PENDING,
    });
    paymentRepository.findByReservationId.mockResolvedValue([
      { type: PaymentType.PAYMENT, value: 5000 } as Payment,
      { type: PaymentType.PAYMENT, value: 5000 } as Payment,
    ]);

    await service.execute({ ...baseRequest, type: PaymentType.PAYMENT });

    expect(reservationRepository.updateStatus).toHaveBeenCalledWith({
      id: 'reservation-1',
      status: ReservationStatus.CONFIRMED,
    });
    expect(
      reservationRepository.countActiveByVehicleBookingId,
    ).not.toHaveBeenCalled();
  });

  it('pula PENDING e vai direto de WAITLIST pra CONFIRMED quando o histórico já soma 100%', async () => {
    paymentRepository.findByReservationId.mockResolvedValue([
      { type: PaymentType.PAYMENT, value: 6000 } as Payment,
      { type: PaymentType.PAYMENT, value: 4000 } as Payment,
    ]);

    await service.execute({ ...baseRequest, type: PaymentType.PAYMENT });

    expect(reservationRepository.updateStatus).toHaveBeenCalledWith({
      id: 'reservation-1',
      status: ReservationStatus.CONFIRMED,
    });
  });

  it('REVERSAL derruba CONFIRMED pra PENDING quando o total cai abaixo de 100%', async () => {
    reservationRepository.findById.mockResolvedValue({
      ...reservation,
      status: ReservationStatus.CONFIRMED,
    });
    paymentRepository.findByReservationId.mockResolvedValue([
      { type: PaymentType.PAYMENT, value: 10000 } as Payment,
      { type: PaymentType.REVERSAL, value: 3000 } as Payment,
    ]);

    await service.execute({ ...baseRequest, type: PaymentType.REVERSAL });

    expect(reservationRepository.updateStatus).toHaveBeenCalledWith({
      id: 'reservation-1',
      status: ReservationStatus.PENDING,
    });
  });

  it('REVERSAL derruba PENDING pra WAITLIST quando o total cai abaixo de 50% (vaga libera)', async () => {
    reservationRepository.findById.mockResolvedValue({
      ...reservation,
      status: ReservationStatus.PENDING,
    });
    paymentRepository.findByReservationId.mockResolvedValue([
      { type: PaymentType.PAYMENT, value: 5000 } as Payment,
      { type: PaymentType.REVERSAL, value: 3000 } as Payment,
    ]);

    await service.execute({ ...baseRequest, type: PaymentType.REVERSAL });

    expect(reservationRepository.updateStatus).toHaveBeenCalledWith({
      id: 'reservation-1',
      status: ReservationStatus.WAITLIST,
    });
  });

  it('não mexe no status quando a reservation já está CANCELED', async () => {
    reservationRepository.findById.mockResolvedValue({
      ...reservation,
      status: ReservationStatus.CANCELED,
    });

    await service.execute({ ...baseRequest, type: PaymentType.PAYMENT });

    expect(vehicleBookingRepository.findById).not.toHaveBeenCalled();
    expect(reservationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('não mexe no status quando a excursion está DONE', async () => {
    excursionRepository.findById.mockResolvedValue({
      ...excursion,
      status: ExcursionStatus.DONE,
    });
    paymentRepository.findByReservationId.mockResolvedValue([
      { type: PaymentType.PAYMENT, value: 10000 } as Payment,
    ]);

    await service.execute({ ...baseRequest, type: PaymentType.PAYMENT });

    expect(reservationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('não promove automaticamente quando o veículo já está lotado (payment continua criado)', async () => {
    reservationRepository.countActiveByVehicleBookingId.mockResolvedValue(10);
    paymentRepository.findByReservationId.mockResolvedValue([
      { type: PaymentType.PAYMENT, value: 10000 } as Payment,
    ]);

    const result = await service.execute({
      ...baseRequest,
      type: PaymentType.PAYMENT,
    });

    expect(result).toEqual({ id: 'payment-1' });
    expect(paymentRepository.create).toHaveBeenCalled();
    expect(reservationRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('não chama updateStatus quando o pagamento não cruza nenhum limiar', async () => {
    paymentRepository.findByReservationId.mockResolvedValue([
      { type: PaymentType.PAYMENT, value: 3000 } as Payment,
    ]);

    await service.execute({ ...baseRequest, type: PaymentType.PAYMENT });

    expect(reservationRepository.updateStatus).not.toHaveBeenCalled();
  });
});
