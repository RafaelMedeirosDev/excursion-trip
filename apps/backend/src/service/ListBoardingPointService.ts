import { Injectable } from '@nestjs/common';
import {
  BoardingPointRepository,
  BoardingPoints,
} from 'src/domain/BoardingPointRepository';

interface Request {
  organizationId: string;
}

@Injectable()
export class ListBoardingPointService {
  constructor(
    private readonly boardingPointRepository: BoardingPointRepository,
  ) {}

  async execute({ organizationId }: Request): Promise<BoardingPoints[]> {
    return await this.boardingPointRepository.findAll({ organizationId });
  }
}
