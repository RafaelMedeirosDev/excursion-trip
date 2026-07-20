import { Injectable } from '@nestjs/common';
import { VehicleBooking } from '@prisma/client';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { VehicleBookingNotFound } from 'src/shared/erros/cases/VehicleBookingNotFound';

interface Request {
  organizationId: string;
  id: string;
}

@Injectable()
export class GetVehicleBookingService {
  constructor(
    private readonly vehicleBookingRepository: VehicleBookingRepository,
  ) {}

  async execute({ organizationId, id }: Request): Promise<VehicleBooking> {
    const vehicleBooking = await this.vehicleBookingRepository.findById({
      id,
    });

    if (!vehicleBooking || vehicleBooking.organizationId !== organizationId) {
      throw new VehicleBookingNotFound();
    }

    return vehicleBooking;
  }
}
