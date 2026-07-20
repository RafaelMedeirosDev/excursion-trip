import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Event, Role } from '@prisma/client';
import { Events } from 'src/domain/EventRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateEventService } from 'src/service/CreateEventService';
import { GetEventService } from 'src/service/GetEventService';
import { ListEventService } from 'src/service/ListEventService';
import { CreateEventDTO } from 'src/shared/dtos/CreateEventDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventController {
  constructor(
    private readonly createEventService: CreateEventService,
    private readonly listEventService: ListEventService,
    private readonly getEventService: GetEventService,
  ) {}

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

  @Get()
  @Roles(Role.ADM)
  list(@CurrentUser() currentUser: JwtPayload): Promise<Events[]> {
    return this.listEventService.execute({
      organizationId: currentUser.organizationId,
    });
  }

  @Get(':id')
  @Roles(Role.ADM)
  get(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Event> {
    return this.getEventService.execute({
      organizationId: currentUser.organizationId,
      id,
    });
  }
}
