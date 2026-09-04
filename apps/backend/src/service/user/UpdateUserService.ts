import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserRepository, Users } from 'src/domain/UserRepository';
import { UserAlreadyExists } from 'src/shared/erros/cases/UserAlreadyExists';
import { UserCannotChangeOwnRole } from 'src/shared/erros/cases/UserCannotChangeOwnRole';
import { UserNotFound } from 'src/shared/erros/cases/UserNotFound';

interface Request {
  organizationId: string;
  currentUserId: string;
  id: string;
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  cpf?: string;
  role?: Role;
}

const SALT_ROUNDS = 10;

@Injectable()
export class UpdateUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    organizationId,
    currentUserId,
    id,
    name,
    email,
    password,
    phone,
    cpf,
    role,
  }: Request): Promise<Users> {
    const user = await this.userRepository.findById({ id });

    if (!user || user.organizationId !== organizationId) {
      throw new UserNotFound();
    }

    if (role && role !== user.role && id === currentUserId) {
      throw new UserCannotChangeOwnRole();
    }

    if (email && email !== user.email) {
      const emailOwner = await this.userRepository.findByEmail({ email });

      if (emailOwner && emailOwner.id !== id) {
        throw new UserAlreadyExists();
      }
    }

    if (cpf && cpf !== user.cpf) {
      const cpfOwner = await this.userRepository.findByCpf({
        organizationId,
        cpf,
      });

      if (cpfOwner && cpfOwner.id !== id) {
        throw new UserAlreadyExists();
      }
    }

    const hashedPassword = password
      ? await bcrypt.hash(password, SALT_ROUNDS)
      : undefined;

    return await this.userRepository.update({
      id,
      name,
      email,
      password: hashedPassword,
      phone,
      cpf,
      role,
    });
  }
}
