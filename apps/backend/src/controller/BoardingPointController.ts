import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BoardingPoint, Role } from '@prisma/client';
import { BoardingPoints } from 'src/domain/BoardingPointRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateBoardingPointService } from 'src/service/boarding-point/CreateBoardingPointService';
import { GetBoardingPointService } from 'src/service/boarding-point/GetBoardingPointService';
import { ListBoardingPointService } from 'src/service/boarding-point/ListBoardingPointService';
import { CreateBoardingPointDTO } from 'src/shared/dtos/CreateBoardingPointDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/boarding-points')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BoardingPointController {
  constructor(
    private readonly createBoardingPointService: CreateBoardingPointService,
    private readonly listBoardingPointService: ListBoardingPointService,
    private readonly getBoardingPointService: GetBoardingPointService,
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

  @Get()
  list(@CurrentUser() currentUser: JwtPayload): Promise<BoardingPoints[]> {
    return this.listBoardingPointService.execute({
      organizationId: currentUser.organizationId,
    });
  }

  @Get(':id')
  get(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<BoardingPoint> {
    return this.getBoardingPointService.execute({
      organizationId: currentUser.organizationId,
      id,
    });
  }
}
