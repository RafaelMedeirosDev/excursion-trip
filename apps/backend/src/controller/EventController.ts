import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Event, Role } from '@prisma/client';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateEventService } from 'src/service/CreateEventService';
import { CreateEventDTO } from 'src/shared/dtos/CreateEventDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventController {
  constructor(private readonly createEventService: CreateEventService) {}

  @Post()
  @Roles(Role.ADM)
  create(
    @Body()
    {
      name,
      address,
      city,
      startDate,
      endDate,
      startTime,
      endTime,
    }: CreateEventDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Event> {
    return this.createEventService.execute({
      organizationId: currentUser.organizationId,
      name,
      address,
      city,
      startDate,
      endDate,
      startTime,
      endTime,
    });
  }
}
