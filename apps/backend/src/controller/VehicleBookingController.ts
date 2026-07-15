import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Role, VehicleBooking } from '@prisma/client';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateVehicleBookingService } from 'src/service/CreateVehicleBookingService';
import { CreateVehicleBookingDTO } from 'src/shared/dtos/CreateVehicleBookingDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/vehicle-bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehicleBookingController {
  constructor(
    private readonly createVehicleBookingService: CreateVehicleBookingService,
  ) {}

  @Post()
  @Roles(Role.ADM)
  create(
    @Body()
    {
      supplierId,
      excursionId,
      userId,
      vehicleType,
      plate,
      capacity,
      value,
      startTime,
      returnTime,
      price,
    }: CreateVehicleBookingDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<VehicleBooking> {
    return this.createVehicleBookingService.execute({
      organizationId: currentUser.organizationId,
      userId,
      supplierId,
      excursionId,
      vehicleType,
      plate,
      capacity,
      value,
      startTime,
      returnTime,
      price,
    });
  }
}
