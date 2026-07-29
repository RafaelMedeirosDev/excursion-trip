import { Injectable } from '@nestjs/common';
import { BoardingPoint } from '@prisma/client';
import { BoardingPointRepository } from 'src/domain/BoardingPointRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { VehicleBookingNotFound } from 'src/shared/erros/cases/VehicleBookingNotFound';

interface Request {
  organizationId: string;
  vehicleBookingId: string;
  address: string;
  time?: string;
}

@Injectable()
export class CreateBoardingPointService {
  constructor(
    private readonly boardingPointRepository: BoardingPointRepository,
    private readonly vehicleBookingRepository: VehicleBookingRepository,
  ) {}

  async execute({
    organizationId,
    vehicleBookingId,
    address,
    time,
  }: Request): Promise<BoardingPoint> {
    const vehicleBooking = await this.vehicleBookingRepository.findById({
      id: vehicleBookingId,
    });

    if (!vehicleBooking || vehicleBooking.organizationId !== organizationId) {
      throw new VehicleBookingNotFound();
    }

    return await this.boardingPointRepository.create({
      organizationId,
      vehicleBookingId,
      address,
      time,
    });
  }
}
