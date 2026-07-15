import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateUserService } from 'src/service/CreateUserService';
import { CreateUserDTO } from 'src/shared/dtos/CreateUserDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  @Roles(Role.ADM)
  create(
    @Body() { name, email, password, phone, cpf, role }: CreateUserDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<User> {
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
}
