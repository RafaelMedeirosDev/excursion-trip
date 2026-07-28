import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { OrganizationRepository } from 'src/domain/OrganizationRepository';
import { RefreshTokenRepository } from 'src/domain/RefreshTokenRepository';
import { UserRepository } from 'src/domain/UserRepository';
import { InvalidRefreshToken } from 'src/shared/erros/cases/InvalidRefreshToken';

interface Request {
  refreshToken: string;
}

interface Response {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly userRepository: UserRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ refreshToken }: Request): Promise<Response> {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const stored = await this.refreshTokenRepository.findByTokenHash({
      tokenHash,
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new InvalidRefreshToken();
    }

    await this.refreshTokenRepository.revoke({ id: stored.id });

    const user = await this.userRepository.findById({ id: stored.userId });

    if (!user) {
      throw new InvalidRefreshToken();
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

    const newRefreshToken = randomBytes(32).toString('hex');
    const newTokenHash = createHash('sha256')
      .update(newRefreshToken)
      .digest('hex');
    const expiresAt = new Date();
    expiresAt.setHours(
      expiresAt.getHours() +
        Number(process.env.REFRESH_TOKEN_EXPIRES_IN_HOURS),
    );

    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
