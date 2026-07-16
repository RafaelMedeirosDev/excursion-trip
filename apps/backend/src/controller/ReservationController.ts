import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Reservation } from '@prisma/client';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateReservationService } from 'src/service/CreateReservationService';
import { CreateReservationDTO } from 'src/shared/dtos/CreateReservationDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationController {
  constructor(
    private readonly createReservationService: CreateReservationService,
  ) {}

  @Post()
  create(
    @Body()
    { customerId, vehicleBookingId, boardingPointId, agreedValue }: CreateReservationDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Reservation> {
    return this.createReservationService.execute({
      organizationId: currentUser.organizationId,
      userId: currentUser.sub,
      customerId,
      vehicleBookingId,
      boardingPointId,
      agreedValue,
    });
  }
}
