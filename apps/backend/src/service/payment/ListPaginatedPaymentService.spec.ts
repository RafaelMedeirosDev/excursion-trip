import { Role } from '@prisma/client';
import { PaginatedPayments, PaymentRepository } from 'src/domain/PaymentRepository';
import { ListPaginatedPaymentService } from './ListPaginatedPaymentService';

describe('ListPaginatedPaymentService', () => {
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let service: ListPaginatedPaymentService;

  const organizationId = 'org-1';
  const userId = 'user-1';

  beforeEach(() => {
    paymentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      findByReservationId: jest.fn(),
    };
    service = new ListPaginatedPaymentService(paymentRepository);
  });

  it('ADM não passa userId pro repository (vê tudo da organização)', async () => {
    const paginated: PaginatedPayments = { data: [], total: 0, page: 1, limit: 10 };
    paymentRepository.findAllPaginated.mockResolvedValue(paginated);

    const result = await service.execute({
      organizationId,
      userId,
      role: Role.ADM,
      page: 1,
      limit: 10,
    });

    expect(paymentRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      userId: undefined,
      query: undefined,
      page: 1,
      limit: 10,
    });
    expect(result).toEqual(paginated);
  });

  it('EMPLOYEE passa o próprio userId pro repository (só vê os próprios)', async () => {
    paymentRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    await service.execute({
      organizationId,
      userId,
      role: Role.EMPLOYEE,
      page: 1,
      limit: 10,
    });

    expect(paymentRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      userId,
      query: undefined,
      page: 1,
      limit: 10,
    });
  });

  it('repassa query, page e limit quando informados', async () => {
    paymentRepository.findAllPaginated.mockResolvedValue({
      data: [],
      total: 0,
      page: 2,
      limit: 5,
    });

    await service.execute({
      organizationId,
      userId,
      role: Role.ADM,
      query: 'Maria',
      page: 2,
      limit: 5,
    });

    expect(paymentRepository.findAllPaginated).toHaveBeenCalledWith({
      organizationId,
      userId: undefined,
      query: 'Maria',
      page: 2,
      limit: 5,
    });
  });
});
