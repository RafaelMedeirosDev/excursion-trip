import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Excursion, Role } from '@prisma/client';
import { Excursions } from 'src/domain/ExcursionRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateExcursionService } from 'src/service/CreateExcursionService';
import { ListExcursionService } from 'src/service/ListExcursionService';
import { UpdateExcursionStatusService } from 'src/service/UpdateExcursionStatusService';
import { CreateExcursionDTO } from 'src/shared/dtos/CreateExcursionDTO';
import { UpdateExcursionStatusDTO } from 'src/shared/dtos/UpdateExcursionStatusDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/excursions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExcursionController {
  constructor(
    private readonly createExcursionService: CreateExcursionService,
    private readonly listExcursionService: ListExcursionService,
    private readonly updateExcursionStatusService: UpdateExcursionStatusService,
  ) {}

  @Post()
  @Roles(Role.ADM)
  create(
    @Body() { eventId, name, departureDate, returnDate }: CreateExcursionDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Excursion> {
    return this.createExcursionService.execute({
      organizationId: currentUser.organizationId,
      userId: currentUser.sub,
      eventId,
      name,
      departureDate,
      returnDate,
    });
  }

  @Get()
  @Roles(Role.ADM)
  list(@CurrentUser() currentUser: JwtPayload): Promise<Excursions[]> {
    return this.listExcursionService.execute({
      organizationId: currentUser.organizationId,
    });
  }

  @Patch(':id/status')
  @Roles(Role.ADM)
  updateStatus(
    @Param('id') id: string,
    @Body() { status, cancelReason }: UpdateExcursionStatusDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Excursion> {
    return this.updateExcursionStatusService.execute({
      organizationId: currentUser.organizationId,
      id,
      status,
      cancelReason,
    });
  }
}
