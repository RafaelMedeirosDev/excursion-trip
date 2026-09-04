import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserRepository, Users } from 'src/domain/UserRepository';
import { UserAlreadyExists } from 'src/shared/erros/cases/UserAlreadyExists';
import { CreateUserService } from './CreateUserService';

jest.mock('bcrypt');

describe('CreateUserService', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let service: CreateUserService;

  const request = {
    organizationId: 'org-1',
    name: 'Ana',
    email: 'ana@example.com',
    password: 'senha123',
    phone: '11999999999',
    cpf: '12345678900',
    role: Role.EMPLOYEE,
  };

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      findByEmail: jest.fn(),
      findByCpf: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new CreateUserService(userRepository);
    (bcrypt.hash as jest.Mock).mockResolvedValue('senha-hasheada');
  });

  it('cria o usuário com a senha hasheada quando email e cpf estão livres', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByCpf.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({ id: 'user-1' } as Users);

    const result = await service.execute(request);

    expect(bcrypt.hash).toHaveBeenCalledWith(request.password, 10);
    expect(userRepository.create).toHaveBeenCalledWith({
      organizationId: request.organizationId,
      name: request.name,
      email: request.email,
      password: 'senha-hasheada',
      phone: request.phone,
      cpf: request.cpf,
      role: request.role,
    });
    expect(result).toEqual({ id: 'user-1' });
  });

  it('lança UserAlreadyExists quando o email já existe', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'outro' } as User);
    userRepository.findByCpf.mockResolvedValue(null);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      UserAlreadyExists,
    );
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('lança UserAlreadyExists quando o cpf já existe na organização', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.findByCpf.mockResolvedValue({ id: 'outro' } as User);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      UserAlreadyExists,
    );
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
