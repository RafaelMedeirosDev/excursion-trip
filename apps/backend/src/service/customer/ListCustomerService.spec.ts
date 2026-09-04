import { CustomerRepository, Customers } from 'src/domain/CustomerRepository';
import { ListCustomerService } from './ListCustomerService';

describe('ListCustomerService', () => {
  let customerRepository: jest.Mocked<CustomerRepository>;
  let service: ListCustomerService;

  const organizationId = 'org-1';

  beforeEach(() => {
    customerRepository = {
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      findByCpf: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new ListCustomerService(customerRepository);
  });

  it('lista os customers da organização informada', async () => {
    const customers = [{ id: 'customer-1', organizationId }] as Customers[];
    customerRepository.findAll.mockResolvedValue(customers);

    const result = await service.execute({ organizationId });

    expect(customerRepository.findAll).toHaveBeenCalledWith({
      organizationId,
    });
    expect(result).toEqual(customers);
  });
});
