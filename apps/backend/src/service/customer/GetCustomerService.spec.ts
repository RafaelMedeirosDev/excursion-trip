import { Customer } from '@prisma/client';
import { CustomerRepository } from 'src/domain/CustomerRepository';
import { CustomerNotFound } from 'src/shared/erros/cases/CustomerNotFound';
import { GetCustomerService } from './GetCustomerService';

describe('GetCustomerService', () => {
  let customerRepository: jest.Mocked<CustomerRepository>;
  let service: GetCustomerService;

  const organizationId = 'org-1';
  const customer = { id: 'customer-1', organizationId } as Customer;

  beforeEach(() => {
    customerRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findByCpf: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new GetCustomerService(customerRepository);
  });

  it('retorna o customer quando pertence à organização', async () => {
    customerRepository.findById.mockResolvedValue(customer);

    const result = await service.execute({
      organizationId,
      id: 'customer-1',
    });

    expect(result).toEqual(customer);
  });

  it('lança CustomerNotFound quando o customer não existe', async () => {
    customerRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ organizationId, id: 'customer-1' }),
    ).rejects.toBeInstanceOf(CustomerNotFound);
  });

  it('lança CustomerNotFound quando o customer é de outra organização', async () => {
    customerRepository.findById.mockResolvedValue({
      ...customer,
      organizationId: 'org-2',
    });

    await expect(
      service.execute({ organizationId, id: 'customer-1' }),
    ).rejects.toBeInstanceOf(CustomerNotFound);
  });
});
