import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  PaginatedVehicleBookings,
  VehicleBookingRepository,
} from 'src/domain/VehicleBookingRepository';

interface Request {
  organizationId: string;
  userId: string;
  role: Role;
  query?: string;
  page?: number;
  limit?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

@Injectable()
export class ListPaginatedVehicleBookingService {
  constructor(
    private readonly vehicleBookingRepository: VehicleBookingRepository,
  ) {}

  async execute({
    organizationId,
    userId,
    role,
    query,
    page,
    limit,
  }: Request): Promise<PaginatedVehicleBookings> {
    return await this.vehicleBookingRepository.findAllPaginated({
      organizationId,
      userId: role === Role.ADM ? undefined : userId,
      query,
      page: page ?? DEFAULT_PAGE,
      limit: limit ?? DEFAULT_LIMIT,
    });
  }
}
