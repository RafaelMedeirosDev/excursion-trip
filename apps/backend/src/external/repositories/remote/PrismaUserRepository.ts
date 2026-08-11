import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import {
  Create,
  FindAll,
  FindAllPaginated,
  FindByCpf,
  FindByEmail,
  FindById,
  PaginatedUsers,
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
  }: Create): Promise<Users> {
    return this.repository.user.create({
      data: { organizationId, name, email, password, phone, cpf, role },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  findByEmail({ email }: FindByEmail): Promise<User | null> {
    return this.repository.user.findUnique({ where: { email } });
  }

  findByCpf({ organizationId, cpf }: FindByCpf): Promise<User | null> {
    return this.repository.user.findFirst({ where: { organizationId, cpf } });
  }

  findById({ id }: FindById): Promise<Users | null> {
    return this.repository.user.findFirst({
      where: { id },
      select: {
        id: true,
        organizationId: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
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

  findAllPaginated({
    organizationId,
    query,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedUsers> {
    const where = {
      organizationId,
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' as const } },
              { email: { contains: query, mode: 'insensitive' as const } },
              { cpf: { contains: query } },
            ],
          }
        : {}),
    };

    return Promise.all([
      this.repository.user.findMany({
        where,
        select: {
          id: true,
          organizationId: true,
          name: true,
          email: true,
          phone: true,
          cpf: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.repository.user.count({ where }),
    ]).then(([data, total]) => ({ data, total, page, limit }));
  }
}
