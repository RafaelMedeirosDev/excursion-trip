import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role, VehicleBooking } from '@prisma/client';
import { VehicleBookings } from 'src/domain/VehicleBookingRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateVehicleBookingService } from 'src/service/CreateVehicleBookingService';
import { ListVehicleBookingService } from 'src/service/ListVehicleBookingService';
import { CreateVehicleBookingDTO } from 'src/shared/dtos/CreateVehicleBookingDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/vehicle-bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class VehicleBookingController {
  constructor(
    private readonly createVehicleBookingService: CreateVehicleBookingService,
    private readonly listVehicleBookingService: ListVehicleBookingService,
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

  @Get()
  @Roles(Role.ADM)
  list(@CurrentUser() currentUser: JwtPayload): Promise<VehicleBookings[]> {
    return this.listVehicleBookingService.execute({
      organizationId: currentUser.organizationId,
    });
  }
}
