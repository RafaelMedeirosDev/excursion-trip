import { Injectable } from '@nestjs/common';
import { ExcursionRepository, Excursions } from 'src/domain/ExcursionRepository';

interface Request {
  organizationId: string;
}

@Injectable()
export class ListExcursionService {
  constructor(private readonly excursionRepository: ExcursionRepository) {}

  async execute({ organizationId }: Request): Promise<Excursions[]> {
    return await this.excursionRepository.findAll({ organizationId });
  }
}
