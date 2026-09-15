import { Excursion, ExcursionStatus } from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { ExcursionInvalidDateRange } from 'src/shared/erros/cases/ExcursionInvalidDateRange';
import { ExcursionNotEditable } from 'src/shared/erros/cases/ExcursionNotEditable';
import { ExcursionNotFound } from 'src/shared/erros/cases/ExcursionNotFound';
import { UpdateExcursionService } from './UpdateExcursionService';

describe('UpdateExcursionService', () => {
  let excursionRepository: jest.Mocked<ExcursionRepository>;
  let service: UpdateExcursionService;

  const existingExcursion = {
    id: 'excursion-1',
    organizationId: 'org-1',
    eventId: 'event-1',
    userId: 'user-1',
    name: 'Excursão Rio Live',
    departureDate: new Date('2026-10-11T00:00:00.000Z'),
    returnDate: new Date('2026-10-12T00:00:00.000Z'),
    status: ExcursionStatus.OPEN,
  } as Excursion;

  const request = { organizationId: 'org-1', id: 'excursion-1' };

  beforeEach(() => {
    excursionRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
      updateStatus: jest.fn(),
    };
    service = new UpdateExcursionService(excursionRepository);
    excursionRepository.findById.mockResolvedValue(existingExcursion);
    excursionRepository.update.mockResolvedValue({
      id: 'excursion-1',
    } as Excursion);
  });

  it('atualiza somente os campos informados', async () => {
    const result = await service.execute({ ...request, name: 'Excursão Rio' });

    expect(excursionRepository.update).toHaveBeenCalledWith({
      id: 'excursion-1',
      name: 'Excursão Rio',
      departureDate: undefined,
      returnDate: undefined,
    });
    expect(result).toEqual({ id: 'excursion-1' });
  });

  it('lança ExcursionInvalidDateRange quando só o returnDate vem, anterior ao departureDate guardado', async () => {
    await expect(
      service.execute({ ...request, returnDate: '2026-10-05' }),
    ).rejects.toBeInstanceOf(ExcursionInvalidDateRange);
    expect(excursionRepository.update).not.toHaveBeenCalled();
  });

  it('lança ExcursionInvalidDateRange quando só o departureDate vem, posterior ao returnDate guardado', async () => {
    await expect(
      service.execute({ ...request, departureDate: '2026-10-20' }),
    ).rejects.toBeInstanceOf(ExcursionInvalidDateRange);
    expect(excursionRepository.update).not.toHaveBeenCalled();
  });

  it('aceita as duas datas juntas quando coerentes', async () => {
    await service.execute({
      ...request,
      departureDate: '2026-11-01',
      returnDate: '2026-11-03',
    });

    expect(excursionRepository.update).toHaveBeenCalledWith({
      id: 'excursion-1',
      name: undefined,
      departureDate: new Date('2026-11-01'),
      returnDate: new Date('2026-11-03'),
    });
  });

  it('aceita datas iguais (viagem de um dia)', async () => {
    await service.execute({
      ...request,
      departureDate: '2026-11-01',
      returnDate: '2026-11-01',
    });

    expect(excursionRepository.update).toHaveBeenCalled();
  });

  it('lança ExcursionNotFound quando a excursão não existe', async () => {
    excursionRepository.findById.mockResolvedValue(null);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      ExcursionNotFound,
    );
    expect(excursionRepository.update).not.toHaveBeenCalled();
  });

  it('lança ExcursionNotFound quando a excursão é de outra organização', async () => {
    excursionRepository.findById.mockResolvedValue({
      ...existingExcursion,
      organizationId: 'org-2',
    });

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      ExcursionNotFound,
    );
    expect(excursionRepository.update).not.toHaveBeenCalled();
  });

  it('lança ExcursionNotEditable quando a excursão está DONE', async () => {
    excursionRepository.findById.mockResolvedValue({
      ...existingExcursion,
      status: ExcursionStatus.DONE,
    });

    await expect(
      service.execute({ ...request, name: 'Outro nome' }),
    ).rejects.toBeInstanceOf(ExcursionNotEditable);
    expect(excursionRepository.update).not.toHaveBeenCalled();
  });

  it('lança ExcursionNotEditable quando a excursão está CANCELED', async () => {
    excursionRepository.findById.mockResolvedValue({
      ...existingExcursion,
      status: ExcursionStatus.CANCELED,
    });

    await expect(
      service.execute({ ...request, name: 'Outro nome' }),
    ).rejects.toBeInstanceOf(ExcursionNotEditable);
    expect(excursionRepository.update).not.toHaveBeenCalled();
  });
});
