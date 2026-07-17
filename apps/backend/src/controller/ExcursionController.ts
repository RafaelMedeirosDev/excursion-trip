import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Excursion, Role } from '@prisma/client';
import { Excursions } from 'src/domain/ExcursionRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateExcursionService } from 'src/service/CreateExcursionService';
import { ListExcursionService } from 'src/service/ListExcursionService';
import { CreateExcursionDTO } from 'src/shared/dtos/CreateExcursionDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/excursions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExcursionController {
  constructor(
    private readonly createExcursionService: CreateExcursionService,
    private readonly listExcursionService: ListExcursionService,
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
}
