import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import {
  Create,
  FindByEmailOrCpf,
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

  findByEmailOrCpf({
    organizationId,
    email,
    cpf,
  }: FindByEmailOrCpf): Promise<User | null> {
    return this.repository.user.findFirst({
      where: {
        organizationId,
        OR: [{ email }, { cpf }],
      },
    });
  }
}
