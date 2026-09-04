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
  Update,
  UserRepository,
  Users,
} from 'src/domain/UserRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

const USER_SELECT = {
  id: true,
  organizationId: true,
  name: true,
  email: true,
  phone: true,
  cpf: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const;

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
      select: USER_SELECT,
    });
  }

  update({ id, name, email, password, phone, cpf, role }: Update): Promise<Users> {
    return this.repository.user.update({
      where: { id },
      data: { name, email, password, phone, cpf, role },
      select: USER_SELECT,
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
      select: USER_SELECT,
    });
  }

  findAll({ organizationId }: FindAll): Promise<Users[]> {
    return this.repository.user.findMany({
      where: { organizationId, deletedAt: null },
      select: USER_SELECT,
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
        select: USER_SELECT,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.repository.user.count({ where }),
    ]).then(([data, total]) => ({ data, total, page, limit }));
  }
}
