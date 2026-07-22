import { Payment, PaymentMethod, PaymentType, Reservation } from '@prisma/client';
import { PaymentRepository } from 'src/domain/PaymentRepository';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { ReservationNotFound } from 'src/shared/erros/cases/ReservationNotFound';
import { CreatePaymentService } from './CreatePaymentService';

describe('CreatePaymentService', () => {
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let service: CreatePaymentService;

  const organizationId = 'org-1';

  const baseRequest = {
    organizationId,
    userId: 'user-1',
    reservationId: 'reservation-1',
    value: 15000,
    method: PaymentMethod.PIX,
  };

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
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };
    service = new CreatePaymentService(paymentRepository, reservationRepository);

    reservationRepository.findById.mockResolvedValue({
      id: 'reservation-1',
      organizationId,
    } as Reservation);
  });

  it('cria o pagamento quando type é PAYMENT', async () => {
    paymentRepository.create.mockResolvedValue({
      id: 'payment-1',
    } as Payment);

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
    paymentRepository.create.mockResolvedValue({
      id: 'payment-2',
    } as Payment);

    await service.execute({ ...baseRequest, type: PaymentType.REVERSAL });

    expect(paymentRepository.create).toHaveBeenCalledWith({
      ...baseRequest,
      type: PaymentType.REVERSAL,
    });
  });

  it('lança ReservationNotFound quando a reserva é de outra organização', async () => {
    reservationRepository.findById.mockResolvedValue({
      id: 'reservation-1',
      organizationId: 'org-2',
    } as Reservation);

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
});
