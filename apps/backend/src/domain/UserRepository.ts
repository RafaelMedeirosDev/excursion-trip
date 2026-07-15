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

  abstract findByEmail({ email }: FindByEmail): Promise<User | null>;

  abstract findByCpf({ organizationId, cpf }: FindByCpf): Promise<User | null>;

  abstract findById({ id }: FindById): Promise<User | null>;
}
