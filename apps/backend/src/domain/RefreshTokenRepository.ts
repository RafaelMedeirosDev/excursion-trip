import { RefreshToken } from '@prisma/client';

export interface Create {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface FindByTokenHash {
  tokenHash: string;
}

export interface Revoke {
  id: string;
}

export abstract class RefreshTokenRepository {
  abstract create({
    userId,
    tokenHash,
    expiresAt,
  }: Create): Promise<RefreshToken>;

  abstract findByTokenHash({
    tokenHash,
  }: FindByTokenHash): Promise<RefreshToken | null>;

  abstract revoke({ id }: Revoke): Promise<RefreshToken>;
}
