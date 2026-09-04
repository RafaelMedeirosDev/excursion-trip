import { JwtService } from '@nestjs/jwt';
import { Organization, Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { OrganizationRepository } from 'src/domain/OrganizationRepository';
import { RefreshTokenRepository } from 'src/domain/RefreshTokenRepository';
import { UserRepository } from 'src/domain/UserRepository';
import { InvalidCredentials } from 'src/shared/erros/cases/InvalidCredentials';
import { LoginService } from './LoginService';

jest.mock('bcrypt');

describe('LoginService', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;
  let organizationRepository: jest.Mocked<OrganizationRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let service: LoginService;

  const user = {
    id: 'user-1',
    organizationId: 'org-1',
    role: Role.ADM,
    name: 'Ana',
    password: 'senha-hasheada',
  } as User;

  const organization = { id: 'org-1', name: 'Organização Teste' } as Organization;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findByEmail: jest.fn(),
      findByCpf: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    refreshTokenRepository = {
      create: jest.fn(),
      findByTokenHash: jest.fn(),
      revoke: jest.fn(),
    };
    organizationRepository = {
      create: jest.fn(),
      findByCnpj: jest.fn(),
      findById: jest.fn(),
    };
    jwtService = { sign: jest.fn() } as unknown as jest.Mocked<JwtService>;
    service = new LoginService(
      userRepository,
      refreshTokenRepository,
      organizationRepository,
      jwtService,
    );

    organizationRepository.findById.mockResolvedValue(organization);
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
      organizationName: organization.name,
      name: user.name,
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
