import { Injectable } from '@nestjs/common';
import { Excursion, ExcursionStatus } from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { ExcursionInvalidDateRange } from 'src/shared/erros/cases/ExcursionInvalidDateRange';
import { ExcursionNotEditable } from 'src/shared/erros/cases/ExcursionNotEditable';
import { ExcursionNotFound } from 'src/shared/erros/cases/ExcursionNotFound';

// Estados terminais da máquina de estados: a viagem já aconteceu ou foi
// cancelada, e as reservas e pagamentos continuam apontando pra ela.
const BLOCKED_STATUSES: ExcursionStatus[] = [
  ExcursionStatus.DONE,
  ExcursionStatus.CANCELED,
];

interface Request {
  organizationId: string;
  id: string;
  name?: string;
  departureDate?: string;
  returnDate?: string;
}

@Injectable()
export class UpdateExcursionService {
  constructor(private readonly excursionRepository: ExcursionRepository) {}

  async execute({
    organizationId,
    id,
    name,
    departureDate,
    returnDate,
  }: Request): Promise<Excursion> {
    const excursion = await this.excursionRepository.findById({ id });

    if (!excursion || excursion.organizationId !== organizationId) {
      throw new ExcursionNotFound();
    }

    if (BLOCKED_STATUSES.includes(excursion.status)) {
      throw new ExcursionNotEditable();
    }

    // o intervalo é validado contra os valores finais, não só contra o payload:
    // mandar só returnDate anterior ao departureDate já guardado tem que falhar
    const nextDepartureDate = departureDate
      ? new Date(departureDate)
      : excursion.departureDate;
    const nextReturnDate = returnDate
      ? new Date(returnDate)
      : excursion.returnDate;

    if (nextReturnDate < nextDepartureDate) {
      throw new ExcursionInvalidDateRange();
    }

    return await this.excursionRepository.update({
      id,
      name,
      departureDate: departureDate ? new Date(departureDate) : undefined,
      returnDate: returnDate ? new Date(returnDate) : undefined,
    });
  }
}
