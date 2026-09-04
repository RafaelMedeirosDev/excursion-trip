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
import { Role } from '@prisma/client';
import { PaginatedUsers, Users } from 'src/domain/UserRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateUserService } from 'src/service/user/CreateUserService';
import { GetUserService } from 'src/service/user/GetUserService';
import { ListUserService } from 'src/service/user/ListUserService';
import { ListPaginatedUserService } from 'src/service/user/ListPaginatedUserService';
import { UpdateUserService } from 'src/service/user/UpdateUserService';
import { CreateUserDTO } from 'src/shared/dtos/CreateUserDTO';
import { ListPaginatedUserDTO } from 'src/shared/dtos/ListPaginatedUserDTO';
import { UpdateUserDTO } from 'src/shared/dtos/UpdateUserDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly listUserService: ListUserService,
    private readonly listPaginatedUserService: ListPaginatedUserService,
    private readonly getUserService: GetUserService,
    private readonly updateUserService: UpdateUserService,
  ) {}

  @Post()
  @Roles(Role.ADM)
  create(
    @Body() { name, email, password, phone, cpf, role }: CreateUserDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Users> {
    return this.createUserService.execute({
      organizationId: currentUser.organizationId,
      name,
      email,
      password,
      phone,
      cpf,
      role,
    });
  }

  @Get()
  @Roles(Role.ADM)
  list(@CurrentUser() currentUser: JwtPayload): Promise<Users[]> {
    return this.listUserService.execute({
      organizationId: currentUser.organizationId,
    });
  }

  @Get('paginated')
  @Roles(Role.ADM)
  listPaginated(
    @Query() { query, page, limit }: ListPaginatedUserDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<PaginatedUsers> {
    return this.listPaginatedUserService.execute({
      organizationId: currentUser.organizationId,
      query,
      page,
      limit,
    });
  }

  @Get(':id')
  get(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Users> {
    return this.getUserService.execute({
      organizationId: currentUser.organizationId,
      id,
    });
  }

  @Patch(':id')
  @Roles(Role.ADM)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() { name, email, password, phone, cpf, role }: UpdateUserDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Users> {
    return this.updateUserService.execute({
      organizationId: currentUser.organizationId,
      currentUserId: currentUser.sub,
      id,
      name,
      email,
      password,
      phone,
      cpf,
      role,
    });
  }
}
