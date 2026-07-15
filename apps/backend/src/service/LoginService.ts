import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/domain/UserRepository';
import { InvalidCredentials } from 'src/shared/erros/cases/InvalidCredentials';

interface Request {
  email: string;
  password: string;
}

interface Response {
  accessToken: string;
}

@Injectable()
export class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ email, password }: Request): Promise<Response> {
    const user = await this.userRepository.findByEmail({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new InvalidCredentials();
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role,
    });

    return { accessToken };
  }
}
