import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import {
  Create,
  FindAll,
  FindByCpf,
  FindByEmail,
  FindById,
  UserRepository,
  Users,
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

  findAll({ organizationId }: FindAll): Promise<Users[]> {
    return this.repository.user.findMany({
      where: { organizationId, deletedAt: null },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
    });
  }
}
