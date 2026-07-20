import { JwtService } from '@nestjs/jwt';
import { RefreshToken, Role, User } from '@prisma/client';
import { createHash } from 'crypto';
import { RefreshTokenRepository } from 'src/domain/RefreshTokenRepository';
import { UserRepository } from 'src/domain/UserRepository';
import { InvalidRefreshToken } from 'src/shared/erros/cases/InvalidRefreshToken';
import { RefreshTokenService } from './RefreshTokenService';

describe('RefreshTokenService', () => {
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let service: RefreshTokenService;

  const rawToken = 'token-valido';
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');

  const user = {
    id: 'user-1',
    organizationId: 'org-1',
    role: Role.ADM,
  } as User;

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
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findByCpf: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    jwtService = { sign: jest.fn() } as unknown as jest.Mocked<JwtService>;
    service = new RefreshTokenService(
      refreshTokenRepository,
      userRepository,
      jwtService,
    );

    refreshTokenRepository.findByTokenHash.mockResolvedValue(storedToken);
    userRepository.findById.mockResolvedValue(user);
    jwtService.sign.mockReturnValue('novo-access-token');
  });

  it('rotaciona o refresh token e gera um accessToken novo quando o token é válido', async () => {
    const result = await service.execute({ refreshToken: rawToken });

    expect(refreshTokenRepository.revoke).toHaveBeenCalledWith({
      id: storedToken.id,
    });
    expect(refreshTokenRepository.create).toHaveBeenCalledWith({
      userId: user.id,
      tokenHash: expect.any(String),
      expiresAt: expect.any(Date),
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role,
    });
    expect(result.accessToken).toEqual('novo-access-token');
    expect(typeof result.refreshToken).toBe('string');
    expect(result.refreshToken).not.toEqual(rawToken);
  });

  it('lança InvalidRefreshToken quando o token não existe', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValue(null);

    await expect(
      service.execute({ refreshToken: rawToken }),
    ).rejects.toBeInstanceOf(InvalidRefreshToken);
    expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
  });

  it('lança InvalidRefreshToken quando o token já foi revogado', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValue({
      ...storedToken,
      revokedAt: new Date(),
    });

    await expect(
      service.execute({ refreshToken: rawToken }),
    ).rejects.toBeInstanceOf(InvalidRefreshToken);
    expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
  });

  it('lança InvalidRefreshToken quando o token expirou', async () => {
    refreshTokenRepository.findByTokenHash.mockResolvedValue({
      ...storedToken,
      expiresAt: new Date(Date.now() - 1000),
    });

    await expect(
      service.execute({ refreshToken: rawToken }),
    ).rejects.toBeInstanceOf(InvalidRefreshToken);
    expect(refreshTokenRepository.revoke).not.toHaveBeenCalled();
  });
});
