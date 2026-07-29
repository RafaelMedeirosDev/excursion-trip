import { RefreshToken } from '@prisma/client';
import { createHash } from 'crypto';
import { RefreshTokenRepository } from 'src/domain/RefreshTokenRepository';
import { LogoutService } from './LogoutService';

describe('LogoutService', () => {
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let service: LogoutService;

  const rawToken = 'token-valido';
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  const storedToken = {
    id: 'refresh-1',
    userId: 'user-1',
    tokenHash,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    revokedAt: null,
  } as RefreshToken;

  beforeEach(() => {
    refreshTokenRepository = {
      create: jest.fn(),
      findByTokenHash: jest.fn(),
      revoke: jest.fn(),
    };
    service = new LogoutService(refreshTokenRepository);
  });

  it('revoga o refresh token quando ele existe e ainda não foi revogado', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValue(storedToken);

    await service.execute({ refreshToken: rawToken });

    expect(refreshTokenRepository.revoke).toHaveBeenCalledWith({
      id: storedToken.id,
    });
  });

  it('não lança erro nem chama revoke quando o token não existe', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValue(null);

    await expect(
      service.execute({ refreshToken: rawToken }),
    ).resolves.toBeUndefined();
    expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
  });

  it('não lança erro nem chama revoke de novo quando o token já estava revogado', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValue({
      ...storedToken,
      revokedAt: new Date(),
    });

    await expect(
      service.execute({ refreshToken: rawToken }),
    ).resolves.toBeUndefined();
    expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
  });
});
