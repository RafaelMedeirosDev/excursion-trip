import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { OrganizationRepository } from 'src/domain/OrganizationRepository';
import { RefreshTokenRepository } from 'src/domain/RefreshTokenRepository';
import { UserRepository } from 'src/domain/UserRepository';
import { InvalidCredentials } from 'src/shared/erros/cases/InvalidCredentials';

interface Request {
  email: string;
  password: string;
}

interface Response {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ email, password }: Request): Promise<Response> {
    const user = await this.userRepository.findByEmail({ email });

    if (
      !user ||
      user.deletedAt ||
      !(await bcrypt.compare(password, user.password))
    ) {
      throw new InvalidCredentials();
    }

    const organization = await this.organizationRepository.findById({
      id: user.organizationId,
    });

    const accessToken = this.jwtService.sign({
      sub: user.id,
      organizationId: user.organizationId,
      organizationName: organization?.name ?? '',
      name: user.name,
      role: user.role,
    });

    const refreshToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() +
        Number(process.env.REFRESH_TOKEN_EXPIRES_IN_HOURS),
    );

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }
}
