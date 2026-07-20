import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RefreshTokenRepository } from 'src/domain/RefreshTokenRepository';
import { UserRepository } from 'src/domain/UserRepository';
import { InvalidCredentials } from 'src/shared/erros/cases/InvalidCredentials';
import { LoginService } from './LoginService';

jest.mock('bcrypt');

describe('LoginService', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let service: LoginService;

  const user = {
    id: 'user-1',
    organizationId: 'org-1',
    role: Role.ADM,
    password: 'senha-hasheada',
  } as User;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findByCpf: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    refreshTokenRepository = {
      create: jest.fn(),
      findByTokenHash: jest.fn(),
      revoke: jest.fn(),
    };
    jwtService = { sign: jest.fn() } as unknown as jest.Mocked<JwtService>;
    service = new LoginService(userRepository, refreshTokenRepository, jwtService);
  });

  it('gera o accessToken e o refreshToken quando as credenciais são válidas', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockReturnValue('token-gerado');

    const result = await service.execute({
      email: 'ana@example.com',
      password: 'senha123',
    });

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role,
    });
    expect(refreshTokenRepository.create).toHaveBeenCalledWith({
      userId: user.id,
      tokenHash: expect.any(String),
      expiresAt: expect.any(Date),
    });
    expect(result.accessToken).toEqual('token-gerado');
    expect(typeof result.refreshToken).toBe('string');
    expect(result.refreshToken.length).toBeGreaterThan(0);
  });

  it('lança InvalidCredentials quando o email não existe', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      service.execute({ email: 'ana@example.com', password: 'senha123' }),
    ).rejects.toBeInstanceOf(InvalidCredentials);
    expect(jwtService.sign).not.toHaveBeenCalled();
    expect(refreshTokenRepository.create).not.toHaveBeenCalled();
  });

  it('lança InvalidCredentials quando a senha está errada', async () => {
    userRepository.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.execute({ email: 'ana@example.com', password: 'senha-errada' }),
    ).rejects.toBeInstanceOf(InvalidCredentials);
    expect(jwtService.sign).not.toHaveBeenCalled();
    expect(refreshTokenRepository.create).not.toHaveBeenCalled();
  });
});
