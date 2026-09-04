import { Customer } from '@prisma/client';
import { CustomerRepository } from 'src/domain/CustomerRepository';
import { CustomerAlreadyExists } from 'src/shared/erros/cases/CustomerAlreadyExists';
import { CustomerNotFound } from 'src/shared/erros/cases/CustomerNotFound';
import { UpdateCustomerService } from './UpdateCustomerService';

describe('UpdateCustomerService', () => {
  let customerRepository: jest.Mocked<CustomerRepository>;
  let service: UpdateCustomerService;

  const existingCustomer = {
    id: 'customer-1',
    organizationId: 'org-1',
    name: 'Ana',
    email: 'ana@example.com',
    phone: '11999999999',
    cpf: '12345678900',
  } as Customer;

  const request = {
    organizationId: 'org-1',
    id: 'customer-1',
  };

  beforeEach(() => {
    customerRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findByCpf: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new UpdateCustomerService(customerRepository);
    customerRepository.findById.mockResolvedValue(existingCustomer);
    customerRepository.update.mockResolvedValue({
      id: 'customer-1',
    } as Customer);
  });

  it('atualiza somente os campos informados', async () => {
    const result = await service.execute({ ...request, phone: '11888888888' });

    expect(customerRepository.update).toHaveBeenCalledWith({
      id: 'customer-1',
      name: undefined,
      email: undefined,
      phone: '11888888888',
      cpf: undefined,
    });
    expect(result).toEqual({ id: 'customer-1' });
  });

  it('repassa email null para limpar o e-mail cadastrado', async () => {
    await service.execute({ ...request, email: null });

    expect(customerRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ email: null }),
    );
  });

  it('lança CustomerNotFound quando o passageiro não existe', async () => {
    customerRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ ...request, name: 'Nova' }),
    ).rejects.toBeInstanceOf(CustomerNotFound);
    expect(customerRepository.update).not.toHaveBeenCalled();
  });

  it('lança CustomerNotFound quando o passageiro é de outra organização', async () => {
    customerRepository.findById.mockResolvedValue({
      ...existingCustomer,
      organizationId: 'org-2',
    } as Customer);

    await expect(
      service.execute({ ...request, name: 'Nova' }),
    ).rejects.toBeInstanceOf(CustomerNotFound);
    expect(customerRepository.update).not.toHaveBeenCalled();
  });

  it('lança CustomerAlreadyExists quando o cpf novo é de outro passageiro', async () => {
    customerRepository.findByCpf.mockResolvedValue({ id: 'outro' } as Customer);

    await expect(
      service.execute({ ...request, cpf: '99999999999' }),
    ).rejects.toBeInstanceOf(CustomerAlreadyExists);
    expect(customerRepository.update).not.toHaveBeenCalled();
  });

  it('não checa duplicidade quando o cpf é o mesmo do próprio passageiro', async () => {
    await service.execute({ ...request, cpf: existingCustomer.cpf });

    expect(customerRepository.findByCpf).not.toHaveBeenCalled();
    expect(customerRepository.update).toHaveBeenCalled();
  });
});
