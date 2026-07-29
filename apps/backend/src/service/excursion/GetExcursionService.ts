import { Injectable } from '@nestjs/common';
import { Excursion } from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { ExcursionNotFound } from 'src/shared/erros/cases/ExcursionNotFound';

interface Request {
  organizationId: string;
  id: string;
}

@Injectable()
export class GetExcursionService {
  constructor(private readonly excursionRepository: ExcursionRepository) {}

  async execute({ organizationId, id }: Request): Promise<Excursion> {
    const excursion = await this.excursionRepository.findById({ id });

    if (!excursion || excursion.organizationId !== organizationId) {
      throw new ExcursionNotFound();
    }

    return excursion;
  }
}
