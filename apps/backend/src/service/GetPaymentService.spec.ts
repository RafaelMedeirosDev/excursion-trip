import { Payment, Role } from '@prisma/client';
import { PaymentRepository } from 'src/domain/PaymentRepository';
import { PaymentNotFound } from 'src/shared/erros/cases/PaymentNotFound';
import { GetPaymentService } from './GetPaymentService';

describe('GetPaymentService', () => {
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let service: GetPaymentService;

  const organizationId = 'org-1';
  const userId = 'user-1';
  const payment = { id: 'payment-1', organizationId, userId } as Payment;

  beforeEach(() => {
    paymentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByReservationId: jest.fn(),
    };
    service = new GetPaymentService(paymentRepository);
  });

  it('ADM: retorna o payment mesmo não sendo o próprio userId', async () => {
    paymentRepository.findById.mockResolvedValue(payment);

    const result = await service.execute({
      organizationId,
      id: 'payment-1',
      userId: 'outro-user',
      role: Role.ADM,
    });

    expect(result).toEqual(payment);
  });

  it('EMPLOYEE: retorna o payment quando é o dono', async () => {
    paymentRepository.findById.mockResolvedValue(payment);

    const result = await service.execute({
      organizationId,
      id: 'payment-1',
      userId,
      role: Role.EMPLOYEE,
    });

    expect(result).toEqual(payment);
  });

  it('EMPLOYEE: lança PaymentNotFound quando o payment é de outro usuário', async () => {
    paymentRepository.findById.mockResolvedValue(payment);

    await expect(
      service.execute({
        organizationId,
        id: 'payment-1',
        userId: 'outro-user',
        role: Role.EMPLOYEE,
      }),
    ).rejects.toBeInstanceOf(PaymentNotFound);
  });

  it('lança PaymentNotFound quando o payment não existe', async () => {
    paymentRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({
        organizationId,
        id: 'payment-1',
        userId,
        role: Role.ADM,
      }),
    ).rejects.toBeInstanceOf(PaymentNotFound);
  });

  it('lança PaymentNotFound quando o payment é de outra organização', async () => {
    paymentRepository.findById.mockResolvedValue({
      ...payment,
      organizationId: 'org-2',
    });

    await expect(
      service.execute({
        organizationId,
        id: 'payment-1',
        userId,
        role: Role.ADM,
      }),
    ).rejects.toBeInstanceOf(PaymentNotFound);
  });
});
