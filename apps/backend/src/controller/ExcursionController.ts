import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Excursion, Role } from '@prisma/client';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateExcursionService } from 'src/service/CreateExcursionService';
import { CreateExcursionDTO } from 'src/shared/dtos/CreateExcursionDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/excursions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExcursionController {
  constructor(private readonly createExcursionService: CreateExcursionService) {}

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
}
