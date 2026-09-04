import { Role } from '@prisma/client';
import { UserRepository, Users } from 'src/domain/UserRepository';
import { UserCannotDeleteThemselves } from 'src/shared/erros/cases/UserCannotDeleteThemselves';
import { UserNotFound } from 'src/shared/erros/cases/UserNotFound';
import { DeleteUserService } from './DeleteUserService';

describe('DeleteUserService', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let service: DeleteUserService;

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
    service = new DeleteUserService(userRepository);
    userRepository.findById.mockResolvedValue(existingUser);
  });

  it('marca o usuário como excluído', async () => {
    await service.execute(request);

    expect(userRepository.softDelete).toHaveBeenCalledWith({ id: 'user-1' });
  });

  it('lança UserNotFound quando o usuário não existe ou já foi excluído', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(service.execute(request)).rejects.toBeInstanceOf(UserNotFound);
    expect(userRepository.softDelete).not.toHaveBeenCalled();
  });

  it('lança UserNotFound quando o usuário é de outra organização', async () => {
    userRepository.findById.mockResolvedValue({
      ...existingUser,
      organizationId: 'org-2',
    } as Users);

    await expect(service.execute(request)).rejects.toBeInstanceOf(UserNotFound);
    expect(userRepository.softDelete).not.toHaveBeenCalled();
  });

  it('lança UserCannotDeleteThemselves quando o ADM tenta excluir a si mesmo', async () => {
    await expect(
      service.execute({ ...request, currentUserId: 'user-1' }),
    ).rejects.toBeInstanceOf(UserCannotDeleteThemselves);
    expect(userRepository.softDelete).not.toHaveBeenCalled();
  });
});
