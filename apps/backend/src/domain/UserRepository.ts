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

export interface FindByEmailOrCpf {
  organizationId: string;
  email: string;
  cpf: string;
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
  }: Create): Promise<User>;

  abstract findByEmailOrCpf({
    organizationId,
    email,
    cpf,
  }: FindByEmailOrCpf): Promise<User | null>;
}
