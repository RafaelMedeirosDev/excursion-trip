import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Users } from 'src/domain/UserRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateUserService } from 'src/service/CreateUserService';
import { GetUserService } from 'src/service/GetUserService';
import { ListUserService } from 'src/service/ListUserService';
import { CreateUserDTO } from 'src/shared/dtos/CreateUserDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(
    private readonly createUserService: CreateUserService,
    private readonly listUserService: ListUserService,
    private readonly getUserService: GetUserService,
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
}
