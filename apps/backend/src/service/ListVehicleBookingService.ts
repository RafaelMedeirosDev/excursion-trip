import { Injectable } from '@nestjs/common';
import {
  VehicleBookingRepository,
  VehicleBookings,
} from 'src/domain/VehicleBookingRepository';

interface Request {
  organizationId: string;
}

@Injectable()
export class ListVehicleBookingService {
  constructor(
    private readonly vehicleBookingRepository: VehicleBookingRepository,
  ) {}

  async execute({ organizationId }: Request): Promise<VehicleBookings[]> {
    return await this.vehicleBookingRepository.findAll({ organizationId });
  }
}
