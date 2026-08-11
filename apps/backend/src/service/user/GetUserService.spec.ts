import { UserRepository, Users } from 'src/domain/UserRepository';
import { UserNotFound } from 'src/shared/erros/cases/UserNotFound';
import { GetUserService } from './GetUserService';

describe('GetUserService', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let service: GetUserService;

  const organizationId = 'org-1';
  const user = { id: 'user-1', organizationId } as Users;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findByCpf: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new GetUserService(userRepository);
  });

  it('retorna o user quando pertence à organização', async () => {
    userRepository.findById.mockResolvedValue(user);

    const result = await service.execute({ organizationId, id: 'user-1' });

    expect(result).toEqual(user);
  });

  it('lança UserNotFound quando o user não existe', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ organizationId, id: 'user-1' }),
    ).rejects.toBeInstanceOf(UserNotFound);
  });

  it('lança UserNotFound quando o user é de outra organização', async () => {
    userRepository.findById.mockResolvedValue({
      ...user,
      organizationId: 'org-2',
    });

    await expect(
      service.execute({ organizationId, id: 'user-1' }),
    ).rejects.toBeInstanceOf(UserNotFound);
  });
});
