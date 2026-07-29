import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { RefreshTokenRepository } from 'src/domain/RefreshTokenRepository';

interface Request {
  refreshToken: string;
}

@Injectable()
export class LogoutService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async execute({ refreshToken }: Request): Promise<void> {
    const tokenHash = createHash('sha256').update(refreshToken).digest('hex');
    const stored = await this.refreshTokenRepository.findByTokenHash({
      tokenHash,
    });

    if (stored && !stored.revokedAt) {
      await this.refreshTokenRepository.revoke({ id: stored.id });
    }
  }
}
