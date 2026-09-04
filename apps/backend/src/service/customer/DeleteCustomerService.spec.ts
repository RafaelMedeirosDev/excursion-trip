import { Customer } from '@prisma/client';
import { CustomerRepository } from 'src/domain/CustomerRepository';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { CustomerHasUpcomingReservations } from 'src/shared/erros/cases/CustomerHasUpcomingReservations';
import { CustomerNotFound } from 'src/shared/erros/cases/CustomerNotFound';
import { DeleteCustomerService } from './DeleteCustomerService';

describe('DeleteCustomerService', () => {
  let customerRepository: jest.Mocked<CustomerRepository>;
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let service: DeleteCustomerService;

  const existingCustomer = {
    id: 'customer-1',
    organizationId: 'org-1',
    name: 'Ana',
    cpf: '12345678900',
  } as Customer;

  const request = { organizationId: 'org-1', id: 'customer-1' };

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
    reservationRepository = {
      create: jest.fn(),
      findActiveByEventAndCustomer: jest.fn(),
      findById: jest.fn(),
      countActiveByVehicleBookingId: jest.fn(),
      countUpcomingByCustomerId: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      updateStatus: jest.fn(),
    };
    service = new DeleteCustomerService(
      customerRepository,
      reservationRepository,
    );
    customerRepository.findById.mockResolvedValue(existingCustomer);
    reservationRepository.countUpcomingByCustomerId.mockResolvedValue(0);
  });

  it('marca o passageiro como excluído quando não há reserva futura', async () => {
    await service.execute(request);

    expect(reservationRepository.countUpcomingByCustomerId).toHaveBeenCalledWith(
      { customerId: 'customer-1' },
    );
    expect(customerRepository.softDelete).toHaveBeenCalledWith({
      id: 'customer-1',
    });
  });

  it('exclui mesmo com histórico de viagens já realizadas', async () => {
    // a contagem só considera excursão não finalizada, então reserva antiga
    // não impede a exclusão
    reservationRepository.countUpcomingByCustomerId.mockResolvedValue(0);

    await service.execute(request);

    expect(customerRepository.softDelete).toHaveBeenCalled();
  });

  it('lança CustomerHasUpcomingReservations quando há reserva em excursão que não terminou', async () => {
    reservationRepository.countUpcomingByCustomerId.mockResolvedValue(2);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      CustomerHasUpcomingReservations,
    );
    expect(customerRepository.softDelete).not.toHaveBeenCalled();
  });

  it('lança CustomerNotFound quando o passageiro não existe ou já foi excluído', async () => {
    customerRepository.findById.mockResolvedValue(null);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      CustomerNotFound,
    );
    expect(customerRepository.softDelete).not.toHaveBeenCalled();
  });

  it('lança CustomerNotFound quando o passageiro é de outra organização', async () => {
    customerRepository.findById.mockResolvedValue({
      ...existingCustomer,
      organizationId: 'org-2',
    } as Customer);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      CustomerNotFound,
    );
    expect(customerRepository.softDelete).not.toHaveBeenCalled();
  });
});
