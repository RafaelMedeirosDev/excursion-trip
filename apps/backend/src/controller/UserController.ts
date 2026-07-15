import { Body, Controller, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateUserService } from 'src/service/CreateUserService';
import { CreateUserDTO } from 'src/shared/dtos/CreateUserDTO';

@Controller('/users')
export class UserController {
  constructor(private readonly createUserService: CreateUserService) {}

  @Post()
  create(
    @Body()
    { organizationId, name, email, password, phone, cpf, role }: CreateUserDTO,
  ): Promise<User> {
    return this.createUserService.execute({
      organizationId,
      name,
      email,
      password,
      phone,
      cpf,
      role,
    });
  }
}
