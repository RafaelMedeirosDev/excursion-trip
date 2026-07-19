import { Injectable } from '@nestjs/common';
import { ExcursionStatus } from '@prisma/client';
import { ExcursionRepository, Excursions } from 'src/domain/ExcursionRepository';

interface Request {
  organizationId: string;
  status?: ExcursionStatus;
}

@Injectable()
export class ListExcursionService {
  constructor(private readonly excursionRepository: ExcursionRepository) {}

  async execute({ organizationId, status }: Request): Promise<Excursions[]> {
    return await this.excursionRepository.findAll({ organizationId, status });
  }
}
