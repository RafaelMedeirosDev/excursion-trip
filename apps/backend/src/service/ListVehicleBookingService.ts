import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  VehicleBookingRepository,
  VehicleBookings,
} from 'src/domain/VehicleBookingRepository';

interface Request {
  organizationId: string;
  userId: string;
  role: Role;
}

@Injectable()
export class ListVehicleBookingService {
  constructor(
    private readonly vehicleBookingRepository: VehicleBookingRepository,
  ) {}

  async execute({
    organizationId,
    userId,
    role,
  }: Request): Promise<VehicleBookings[]> {
    return await this.vehicleBookingRepository.findAll({
      organizationId,
      userId: role === Role.ADM ? undefined : userId,
    });
  }
}
