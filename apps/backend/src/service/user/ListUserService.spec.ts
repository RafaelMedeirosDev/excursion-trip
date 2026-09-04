import { Role } from '@prisma/client';
import { UserRepository, Users } from 'src/domain/UserRepository';
import { ListUserService } from './ListUserService';

describe('ListUserService', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let service: ListUserService;

  const organizationId = 'org-1';

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
    service = new ListUserService(userRepository);
  });

  it('lista os users da organização informada', async () => {
    const users = [
      { id: 'user-1', organizationId, role: Role.ADM },
    ] as Users[];
    userRepository.findAll.mockResolvedValue(users);

    const result = await service.execute({ organizationId });

    expect(userRepository.findAll).toHaveBeenCalledWith({ organizationId });
    expect(result).toEqual(users);
  });
});
