import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Reservation } from '@prisma/client';
import { Reservations } from 'src/domain/ReservationRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CancelReservationService } from 'src/service/CancelReservationService';
import { ConfirmReservationService } from 'src/service/ConfirmReservationService';
import { CreateReservationService } from 'src/service/CreateReservationService';
import { GetReservationService } from 'src/service/GetReservationService';
import { ListReservationService } from 'src/service/ListReservationService';
import { PendingReservationService } from 'src/service/PendingReservationService';
import { CancelReservationDTO } from 'src/shared/dtos/CancelReservationDTO';
import { CreateReservationDTO } from 'src/shared/dtos/CreateReservationDTO';
import { ListReservationDTO } from 'src/shared/dtos/ListReservationDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationController {
  constructor(
    private readonly createReservationService: CreateReservationService,
    private readonly listReservationService: ListReservationService,
    private readonly pendingReservationService: PendingReservationService,
    private readonly confirmReservationService: ConfirmReservationService,
    private readonly cancelReservationService: CancelReservationService,
    private readonly getReservationService: GetReservationService,
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
  list(
    @Query() { status, vehicleBookingId }: ListReservationDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Reservations[]> {
    return this.listReservationService.execute({
      organizationId: currentUser.organizationId,
      userId: currentUser.sub,
      role: currentUser.role,
      status,
      vehicleBookingId,
    });
  }

  @Get(':id')
  get(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Reservation> {
    return this.getReservationService.execute({
      organizationId: currentUser.organizationId,
      userId: currentUser.sub,
      role: currentUser.role,
      id,
    });
  }

  @Post(':id/pending')
  pending(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Reservation> {
    return this.pendingReservationService.execute({
      organizationId: currentUser.organizationId,
      userId: currentUser.sub,
      role: currentUser.role,
      id,
    });
  }

  @Post(':id/confirm')
  confirm(
    @Param('id') id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Reservation> {
    return this.confirmReservationService.execute({
      organizationId: currentUser.organizationId,
      userId: currentUser.sub,
      role: currentUser.role,
      id,
    });
  }

  @Post(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body() { cancelReason }: CancelReservationDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Reservation> {
    return this.cancelReservationService.execute({
      organizationId: currentUser.organizationId,
      userId: currentUser.sub,
      role: currentUser.role,
      id,
      cancelReason,
    });
  }
}
