import { Injectable } from '@nestjs/common';
import { BoardingPoint } from '@prisma/client';
import { BoardingPointRepository } from 'src/domain/BoardingPointRepository';
import { BoardingPointNotFound } from 'src/shared/erros/cases/BoardingPointNotFound';

interface Request {
  organizationId: string;
  id: string;
}

@Injectable()
export class GetBoardingPointService {
  constructor(
    private readonly boardingPointRepository: BoardingPointRepository,
  ) {}

  async execute({ organizationId, id }: Request): Promise<BoardingPoint> {
    const boardingPoint = await this.boardingPointRepository.findById({ id });

    if (!boardingPoint || boardingPoint.organizationId !== organizationId) {
      throw new BoardingPointNotFound();
    }

    return boardingPoint;
  }
}
