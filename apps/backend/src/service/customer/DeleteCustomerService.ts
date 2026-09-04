import { Injectable } from '@nestjs/common';
import { CustomerRepository } from 'src/domain/CustomerRepository';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { CustomerHasUpcomingReservations } from 'src/shared/erros/cases/CustomerHasUpcomingReservations';
import { CustomerNotFound } from 'src/shared/erros/cases/CustomerNotFound';

interface Request {
  organizationId: string;
  id: string;
}

@Injectable()
export class DeleteCustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly reservationRepository: ReservationRepository,
  ) {}

  async execute({ organizationId, id }: Request): Promise<void> {
    const customer = await this.customerRepository.findById({ id });

    if (!customer || customer.organizationId !== organizationId) {
      throw new CustomerNotFound();
    }

    const upcomingReservations =
      await this.reservationRepository.countUpcomingByCustomerId({
        customerId: id,
      });

    if (upcomingReservations > 0) {
      throw new CustomerHasUpcomingReservations();
    }

    await this.customerRepository.softDelete({ id });
  }
}
