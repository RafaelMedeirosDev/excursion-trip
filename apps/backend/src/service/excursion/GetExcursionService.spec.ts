import { Excursion } from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { ExcursionNotFound } from 'src/shared/erros/cases/ExcursionNotFound';
import { GetExcursionService } from './GetExcursionService';

describe('GetExcursionService', () => {
  let excursionRepository: jest.Mocked<ExcursionRepository>;
  let service: GetExcursionService;

  const organizationId = 'org-1';
  const excursion = { id: 'excursion-1', organizationId } as Excursion;

  beforeEach(() => {
    excursionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };
    service = new GetExcursionService(excursionRepository);
  });

  it('retorna a excursion quando pertence à organização', async () => {
    excursionRepository.findById.mockResolvedValue(excursion);

    const result = await service.execute({
      organizationId,
      id: 'excursion-1',
    });

    expect(result).toEqual(excursion);
  });

  it('lança ExcursionNotFound quando a excursion não existe', async () => {
    excursionRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ organizationId, id: 'excursion-1' }),
    ).rejects.toBeInstanceOf(ExcursionNotFound);
  });

  it('lança ExcursionNotFound quando a excursion é de outra organização', async () => {
    excursionRepository.findById.mockResolvedValue({
      ...excursion,
      organizationId: 'org-2',
    });

    await expect(
      service.execute({ organizationId, id: 'excursion-1' }),
    ).rejects.toBeInstanceOf(ExcursionNotFound);
  });
});
