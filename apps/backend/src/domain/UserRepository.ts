import { Role, User } from '@prisma/client';

export interface Create {
  organizationId: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  role: Role;
}

export interface FindByEmail {
  email: string;
}

export interface FindByCpf {
  organizationId: string;
  cpf: string;
}

export interface FindById {
  id: string;
}

export interface FindAll {
  organizationId: string;
}

export interface FindAllPaginated {
  organizationId: string;
  query?: string;
  page: number;
  limit: number;
}

export type Users = Omit<User, 'password' | 'deletedAt'>;

export interface PaginatedUsers {
  data: Users[];
  total: number;
  page: number;
  limit: number;
}

export abstract class UserRepository {
  abstract create({
    organizationId,
    name,
    email,
    password,
    phone,
    cpf,
    role,
  }: Create): Promise<Users>;

  abstract findByEmail({ email }: FindByEmail): Promise<User | null>;

  abstract findByCpf({ organizationId, cpf }: FindByCpf): Promise<User | null>;

  abstract findById({ id }: FindById): Promise<Users | null>;

  abstract findAll({ organizationId }: FindAll): Promise<Users[]>;

  abstract findAllPaginated({
    organizationId,
    query,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedUsers>;
}
