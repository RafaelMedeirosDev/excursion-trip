import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Reservation } from '@prisma/client';
import { Reservations } from 'src/domain/ReservationRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateReservationService } from 'src/service/CreateReservationService';
import { ListReservationService } from 'src/service/ListReservationService';
import { CreateReservationDTO } from 'src/shared/dtos/CreateReservationDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationController {
  constructor(
    private readonly createReservationService: CreateReservationService,
    private readonly listReservationService: ListReservationService,
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

  @Get()
  list(@CurrentUser() currentUser: JwtPayload): Promise<Reservations[]> {
    return this.listReservationService.execute({
      organizationId: currentUser.organizationId,
      userId: currentUser.sub,
      role: currentUser.role,
    });
  }
}
