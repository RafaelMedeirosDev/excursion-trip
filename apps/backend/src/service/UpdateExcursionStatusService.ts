import { Injectable } from '@nestjs/common';
import { Excursion, ExcursionStatus } from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { ExcursionCancelReasonRequired } from 'src/shared/erros/cases/ExcursionCancelReasonRequired';
import { ExcursionNotFound } from 'src/shared/erros/cases/ExcursionNotFound';
import { InvalidExcursionStatusTransition } from 'src/shared/erros/cases/InvalidExcursionStatusTransition';

interface Request {
  organizationId: string;
  id: string;
  status: ExcursionStatus;
  cancelReason?: string;
}

const ALLOWED_TRANSITIONS: Record<ExcursionStatus, ExcursionStatus[]> = {
  PLANNING: [ExcursionStatus.OPEN, ExcursionStatus.CANCELED],
  OPEN: [ExcursionStatus.CLOSED, ExcursionStatus.CANCELED],
  CLOSED: [ExcursionStatus.DONE, ExcursionStatus.CANCELED],
  DONE: [],
  CANCELED: [],
};

@Injectable()
export class UpdateExcursionStatusService {
  constructor(private readonly excursionRepository: ExcursionRepository) {}

  async execute({
    organizationId,
    id,
    status,
    cancelReason,
  }: Request): Promise<Excursion> {
    const excursion = await this.excursionRepository.findById({ id });

    if (!excursion || excursion.organizationId !== organizationId) {
      throw new ExcursionNotFound();
    }

    if (!ALLOWED_TRANSITIONS[excursion.status].includes(status)) {
      throw new InvalidExcursionStatusTransition();
    }

    if (status === ExcursionStatus.CANCELED && !cancelReason) {
      throw new ExcursionCancelReasonRequired();
    }

    return await this.excursionRepository.updateStatus({
      id,
      status,
      canceledAt: status === ExcursionStatus.CANCELED ? new Date() : undefined,
      cancelReason:
        status === ExcursionStatus.CANCELED ? cancelReason : undefined,
    });
  }
}
