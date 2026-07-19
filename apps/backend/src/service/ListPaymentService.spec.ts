import { Role } from '@prisma/client';
import { PaymentRepository, Payments } from 'src/domain/PaymentRepository';
import { ListPaymentService } from './ListPaymentService';

describe('ListPaymentService', () => {
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let service: ListPaymentService;

  const organizationId = 'org-1';
  const userId = 'user-1';

  beforeEach(() => {
    paymentRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByReservationId: jest.fn(),
    };
    service = new ListPaymentService(paymentRepository);
  });

  it('ADM: lista todos os pagamentos da organização, sem filtrar por userId', async () => {
    const payments = [{ id: 'payment-1', organizationId }] as Payments[];
    paymentRepository.findAll.mockResolvedValue(payments);

    const result = await service.execute({
      organizationId,
      userId,
      role: Role.ADM,
    });

    expect(paymentRepository.findAll).toHaveBeenCalledWith({
      organizationId,
      userId: undefined,
    });
    expect(result).toEqual(payments);
  });

  it('EMPLOYEE: lista só os pagamentos registrados por ele (filtra por userId)', async () => {
    const payments = [
      { id: 'payment-1', organizationId, userId },
    ] as Payments[];
    paymentRepository.findAll.mockResolvedValue(payments);

    const result = await service.execute({
      organizationId,
      userId,
      role: Role.EMPLOYEE,
    });

    expect(paymentRepository.findAll).toHaveBeenCalledWith({
      organizationId,
      userId,
    });
    expect(result).toEqual(payments);
  });
});
