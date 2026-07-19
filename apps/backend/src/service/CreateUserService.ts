import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserRepository, Users } from 'src/domain/UserRepository';
import { UserAlreadyExists } from 'src/shared/erros/cases/UserAlreadyExists';

interface Request {
  organizationId: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  cpf: string;
  role: Role;
}

const SALT_ROUNDS = 10;

@Injectable()
export class CreateUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({
    organizationId,
    name,
    email,
    password,
    phone,
    cpf,
    role,
  }: Request): Promise<Users> {
    const emailAlreadyExists = await this.userRepository.findByEmail({
      email,
    });
    const cpfAlreadyExists = await this.userRepository.findByCpf({
      organizationId,
      cpf,
    });

    if (emailAlreadyExists || cpfAlreadyExists) {
      throw new UserAlreadyExists();
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    return await this.userRepository.create({
      organizationId,
      name,
      email,
      password: hashedPassword,
      phone,
      cpf,
      role,
    });
  }
}
