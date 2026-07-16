import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BoardingPoint, Role } from '@prisma/client';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateBoardingPointService } from 'src/service/CreateBoardingPointService';
import { CreateBoardingPointDTO } from 'src/shared/dtos/CreateBoardingPointDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/boarding-points')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BoardingPointController {
  constructor(
    private readonly createBoardingPointService: CreateBoardingPointService,
  ) {}

  @Post()
  @Roles(Role.ADM)
  create(
    @Body() { vehicleBookingId, address, time }: CreateBoardingPointDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<BoardingPoint> {
    return this.createBoardingPointService.execute({
      organizationId: currentUser.organizationId,
      vehicleBookingId,
      address,
      time,
    });
  }
}
