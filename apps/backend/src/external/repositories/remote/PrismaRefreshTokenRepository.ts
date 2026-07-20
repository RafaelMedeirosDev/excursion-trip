import { Injectable } from '@nestjs/common';
import { RefreshToken } from '@prisma/client';
import {
  Create,
  FindByTokenHash,
  RefreshTokenRepository,
  Revoke,
} from 'src/domain/RefreshTokenRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly repository: PrismaRemoteRepository) {}

  create({ userId, tokenHash, expiresAt }: Create): Promise<RefreshToken> {
    return this.repository.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  findByTokenHash({
    tokenHash,
  }: FindByTokenHash): Promise<RefreshToken | null> {
    return this.repository.refreshToken.findFirst({ where: { tokenHash } });
  }

  revoke({ id }: Revoke): Promise<RefreshToken> {
    return this.repository.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}
