import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Excursion, Role } from '@prisma/client';
import { Excursions, PaginatedExcursions } from 'src/domain/ExcursionRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateExcursionService } from 'src/service/excursion/CreateExcursionService';
import { GetExcursionService } from 'src/service/excursion/GetExcursionService';
import { ListExcursionService } from 'src/service/excursion/ListExcursionService';
import { ListPaginatedExcursionService } from 'src/service/excursion/ListPaginatedExcursionService';
import { UpdateExcursionStatusService } from 'src/service/excursion/UpdateExcursionStatusService';
import { CreateExcursionDTO } from 'src/shared/dtos/CreateExcursionDTO';
import { ListExcursionDTO } from 'src/shared/dtos/ListExcursionDTO';
import { ListPaginatedExcursionDTO } from 'src/shared/dtos/ListPaginatedExcursionDTO';
import { UpdateExcursionStatusDTO } from 'src/shared/dtos/UpdateExcursionStatusDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/excursions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExcursionController {
  constructor(
    private readonly createExcursionService: CreateExcursionService,
    private readonly listExcursionService: ListExcursionService,
    private readonly listPaginatedExcursionService: ListPaginatedExcursionService,
    private readonly updateExcursionStatusService: UpdateExcursionStatusService,
    private readonly getExcursionService: GetExcursionService,
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
  list(
    @Query() { status }: ListExcursionDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Excursions[]> {
    return this.listExcursionService.execute({
      organizationId: currentUser.organizationId,
      status,
    });
  }

  @Get('paginated')
  @Roles(Role.ADM)
  listPaginated(
    @Query() { status, eventName, page, limit }: ListPaginatedExcursionDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<PaginatedExcursions> {
    return this.listPaginatedExcursionService.execute({
      organizationId: currentUser.organizationId,
      status,
      eventName,
      page,
      limit,
    });
  }

  @Get(':id')
  get(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Excursion> {
    return this.getExcursionService.execute({
      organizationId: currentUser.organizationId,
      id,
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
