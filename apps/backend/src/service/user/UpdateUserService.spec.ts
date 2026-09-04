import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserRepository, Users } from 'src/domain/UserRepository';
import { UserAlreadyExists } from 'src/shared/erros/cases/UserAlreadyExists';
import { UserCannotChangeOwnRole } from 'src/shared/erros/cases/UserCannotChangeOwnRole';
import { UserNotFound } from 'src/shared/erros/cases/UserNotFound';
import { UpdateUserService } from './UpdateUserService';

jest.mock('bcrypt');

describe('UpdateUserService', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let service: UpdateUserService;

  const existingUser = {
    id: 'user-1',
    organizationId: 'org-1',
    name: 'Ana',
    email: 'ana@example.com',
    phone: '11999999999',
    cpf: '12345678900',
    role: Role.EMPLOYEE,
  } as Users;

  const request = {
    organizationId: 'org-1',
    currentUserId: 'adm-1',
    id: 'user-1',
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
    service = new UpdateUserService(userRepository);
    userRepository.findById.mockResolvedValue(existingUser);
    userRepository.update.mockResolvedValue({ id: 'user-1' } as Users);
    (bcrypt.hash as jest.Mock).mockResolvedValue('senha-hasheada');
  });

  it('atualiza somente os campos informados', async () => {
    const result = await service.execute({ ...request, phone: '11888888888' });

    expect(userRepository.update).toHaveBeenCalledWith({
      id: 'user-1',
      name: undefined,
      email: undefined,
      password: undefined,
      phone: '11888888888',
      cpf: undefined,
      role: undefined,
    });
    expect(bcrypt.hash).not.toHaveBeenCalled();
    expect(result).toEqual({ id: 'user-1' });
  });

  it('hasheia a senha quando ela é informada', async () => {
    await service.execute({ ...request, password: 'novaSenha' });

    expect(bcrypt.hash).toHaveBeenCalledWith('novaSenha', 10);
    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'senha-hasheada' }),
    );
  });

  it('lança UserNotFound quando o usuário não existe', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(service.execute({ ...request, name: 'Nova' })).rejects.toBeInstanceOf(
      UserNotFound,
    );
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('lança UserNotFound quando o usuário é de outra organização', async () => {
    userRepository.findById.mockResolvedValue({
      ...existingUser,
      organizationId: 'org-2',
    } as Users);

    await expect(service.execute({ ...request, name: 'Nova' })).rejects.toBeInstanceOf(
      UserNotFound,
    );
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('lança UserCannotChangeOwnRole quando o ADM tenta alterar o próprio role', async () => {
    await expect(
      service.execute({ ...request, currentUserId: 'user-1', role: Role.ADM }),
    ).rejects.toBeInstanceOf(UserCannotChangeOwnRole);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('permite reenviar o próprio role sem alteração', async () => {
    await service.execute({
      ...request,
      currentUserId: 'user-1',
      role: Role.EMPLOYEE,
    });

    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ role: Role.EMPLOYEE }),
    );
  });

  it('lança UserAlreadyExists quando o email novo é de outro usuário', async () => {
    userRepository.findByEmail.mockResolvedValue({ id: 'outro' } as User);

    await expect(
      service.execute({ ...request, email: 'ocupado@example.com' }),
    ).rejects.toBeInstanceOf(UserAlreadyExists);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('lança UserAlreadyExists quando o cpf novo é de outro usuário da organização', async () => {
    userRepository.findByCpf.mockResolvedValue({ id: 'outro' } as User);

    await expect(
      service.execute({ ...request, cpf: '99999999999' }),
    ).rejects.toBeInstanceOf(UserAlreadyExists);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('não checa duplicidade quando email e cpf são os mesmos do próprio usuário', async () => {
    await service.execute({
      ...request,
      email: existingUser.email,
      cpf: existingUser.cpf,
    });

    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(userRepository.findByCpf).not.toHaveBeenCalled();
    expect(userRepository.update).toHaveBeenCalled();
  });
});
