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
import { Event, Role } from '@prisma/client';
import { Events, PaginatedEvents } from 'src/domain/EventRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateEventService } from 'src/service/event/CreateEventService';
import { GetEventService } from 'src/service/event/GetEventService';
import { ListEventService } from 'src/service/event/ListEventService';
import { ListPaginatedEventService } from 'src/service/event/ListPaginatedEventService';
import { CreateEventDTO } from 'src/shared/dtos/CreateEventDTO';
import { ListPaginatedEventDTO } from 'src/shared/dtos/ListPaginatedEventDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventController {
  constructor(
    private readonly createEventService: CreateEventService,
    private readonly listEventService: ListEventService,
    private readonly listPaginatedEventService: ListPaginatedEventService,
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
      state,
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
      state,
      startDate,
      endDate,
      startTime,
      endTime,
    });
  }

  @Get()
  list(@CurrentUser() currentUser: JwtPayload): Promise<Events[]> {
    return this.listEventService.execute({
      organizationId: currentUser.organizationId,
    });
  }

  @Get('paginated')
  listPaginated(
    @Query() { name, page, limit }: ListPaginatedEventDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<PaginatedEvents> {
    return this.listPaginatedEventService.execute({
      organizationId: currentUser.organizationId,
      name,
      page,
      limit,
    });
  }

  @Get(':id')
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
