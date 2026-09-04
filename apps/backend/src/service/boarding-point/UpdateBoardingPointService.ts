import { Injectable } from '@nestjs/common';
import { BoardingPoint } from '@prisma/client';
import { BoardingPointRepository } from 'src/domain/BoardingPointRepository';
import { BoardingPointNotFound } from 'src/shared/erros/cases/BoardingPointNotFound';

interface Request {
  organizationId: string;
  id: string;
  address?: string;
  time?: string | null;
}

@Injectable()
export class UpdateBoardingPointService {
  constructor(
    private readonly boardingPointRepository: BoardingPointRepository,
  ) {}

  async execute({
    organizationId,
    id,
    address,
    time,
  }: Request): Promise<BoardingPoint> {
    const boardingPoint = await this.boardingPointRepository.findById({ id });

    if (
      !boardingPoint ||
      boardingPoint.organizationId !== organizationId
    ) {
      throw new BoardingPointNotFound();
    }

    return await this.boardingPointRepository.update({ id, address, time });
  }
}
