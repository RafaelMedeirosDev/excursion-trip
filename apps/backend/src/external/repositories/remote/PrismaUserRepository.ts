import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import {
  Create,
  FindByCpf,
  FindByEmail,
  FindById,
  UserRepository,
} from 'src/domain/UserRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly repository: PrismaRemoteRepository) {}

  create({
    organizationId,
    name,
    email,
    password,
    phone,
    cpf,
    role,
  }: Create): Promise<User> {
    return this.repository.user.create({
      data: { organizationId, name, email, password, phone, cpf, role },
    });
  }

  findByEmail({ email }: FindByEmail): Promise<User | null> {
    return this.repository.user.findUnique({ where: { email } });
  }

  findByCpf({ organizationId, cpf }: FindByCpf): Promise<User | null> {
    return this.repository.user.findFirst({ where: { organizationId, cpf } });
  }

  findById({ id }: FindById): Promise<User | null> {
    return this.repository.user.findFirst({ where: { id } });
  }
}
