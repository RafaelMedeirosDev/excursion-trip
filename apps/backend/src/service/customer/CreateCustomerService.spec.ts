import { Customer } from '@prisma/client';
import { CustomerRepository } from 'src/domain/CustomerRepository';
import { CustomerAlreadyExists } from 'src/shared/erros/cases/CustomerAlreadyExists';
import { CreateCustomerService } from './CreateCustomerService';

describe('CreateCustomerService', () => {
  let customerRepository: jest.Mocked<CustomerRepository>;
  let service: CreateCustomerService;

  const request = {
    organizationId: 'org-1',
    name: 'João',
    phone: '11999999999',
    cpf: '12345678900',
  };

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
    service = new CreateCustomerService(customerRepository);
  });

  it('cria o cliente quando o cpf ainda não existe na organização', async () => {
    customerRepository.findByCpf.mockResolvedValue(null);
    customerRepository.create.mockResolvedValue({
      id: 'customer-1',
    } as Customer);

    const result = await service.execute(request);

    expect(customerRepository.findByCpf).toHaveBeenCalledWith({
      organizationId: request.organizationId,
      cpf: request.cpf,
    });
    expect(customerRepository.create).toHaveBeenCalledWith(request);
    expect(result).toEqual({ id: 'customer-1' });
  });

  it('restaura o passageiro quando o cpf pertence a um cadastro excluído', async () => {
    customerRepository.findByCpf.mockResolvedValue({
      id: 'customer-antigo',
      deletedAt: new Date(),
    } as Customer);
    customerRepository.restore.mockResolvedValue({
      id: 'customer-antigo',
    } as Customer);

    const result = await service.execute(request);

    expect(customerRepository.restore).toHaveBeenCalledWith({
      id: 'customer-antigo',
      name: request.name,
      email: undefined,
      phone: request.phone,
    });
    expect(customerRepository.create).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 'customer-antigo' });
  });

  it('lança CustomerAlreadyExists quando o cpf já existe na organização', async () => {
    customerRepository.findByCpf.mockResolvedValue({
      id: 'outro',
    } as Customer);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      CustomerAlreadyExists,
    );
    expect(customerRepository.create).not.toHaveBeenCalled();
  });
});
