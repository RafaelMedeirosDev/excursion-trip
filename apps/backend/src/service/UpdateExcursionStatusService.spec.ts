import { Excursion, ExcursionStatus } from '@prisma/client';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { ExcursionCancelReasonRequired } from 'src/shared/erros/cases/ExcursionCancelReasonRequired';
import { ExcursionNotFound } from 'src/shared/erros/cases/ExcursionNotFound';
import { InvalidExcursionStatusTransition } from 'src/shared/erros/cases/InvalidExcursionStatusTransition';
import { UpdateExcursionStatusService } from './UpdateExcursionStatusService';

describe('UpdateExcursionStatusService', () => {
  let excursionRepository: jest.Mocked<ExcursionRepository>;
  let service: UpdateExcursionStatusService;

  const organizationId = 'org-1';
  const id = 'excursion-1';

  beforeEach(() => {
    excursionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };
    service = new UpdateExcursionStatusService(excursionRepository);
  });

  it('faz a transição quando é permitida (PLANNING -> OPEN)', async () => {
    excursionRepository.findById.mockResolvedValue({
      id,
      organizationId,
      status: ExcursionStatus.PLANNING,
    } as Excursion);
    excursionRepository.updateStatus.mockResolvedValue({
      id,
      status: ExcursionStatus.OPEN,
    } as Excursion);

    const result = await service.execute({
      organizationId,
      id,
      status: ExcursionStatus.OPEN,
    });

    expect(excursionRepository.updateStatus).toHaveBeenCalledWith({
      id,
      status: ExcursionStatus.OPEN,
      canceledAt: undefined,
      cancelReason: undefined,
    });
    expect(result).toEqual({ id, status: ExcursionStatus.OPEN });
  });

  it('lança ExcursionNotFound quando a excursão não existe', async () => {
    excursionRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ organizationId, id, status: ExcursionStatus.OPEN }),
    ).rejects.toBeInstanceOf(ExcursionNotFound);
    expect(excursionRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('lança ExcursionNotFound quando a excursão é de outra organização', async () => {
    excursionRepository.findById.mockResolvedValue({
      id,
      organizationId: 'org-2',
      status: ExcursionStatus.PLANNING,
    } as Excursion);

    await expect(
      service.execute({ organizationId, id, status: ExcursionStatus.OPEN }),
    ).rejects.toBeInstanceOf(ExcursionNotFound);
    expect(excursionRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('lança InvalidExcursionStatusTransition quando a transição pula etapa (PLANNING -> DONE)', async () => {
    excursionRepository.findById.mockResolvedValue({
      id,
      organizationId,
      status: ExcursionStatus.PLANNING,
    } as Excursion);

    await expect(
      service.execute({ organizationId, id, status: ExcursionStatus.DONE }),
    ).rejects.toBeInstanceOf(InvalidExcursionStatusTransition);
    expect(excursionRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('lança InvalidExcursionStatusTransition quando a excursão já está em estado final (DONE)', async () => {
    excursionRepository.findById.mockResolvedValue({
      id,
      organizationId,
      status: ExcursionStatus.DONE,
    } as Excursion);

    await expect(
      service.execute({ organizationId, id, status: ExcursionStatus.CANCELED }),
    ).rejects.toBeInstanceOf(InvalidExcursionStatusTransition);
    expect(excursionRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('lança ExcursionCancelReasonRequired quando cancela sem cancelReason', async () => {
    excursionRepository.findById.mockResolvedValue({
      id,
      organizationId,
      status: ExcursionStatus.OPEN,
    } as Excursion);

    await expect(
      service.execute({
        organizationId,
        id,
        status: ExcursionStatus.CANCELED,
      }),
    ).rejects.toBeInstanceOf(ExcursionCancelReasonRequired);
    expect(excursionRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('cancela com sucesso quando cancelReason é informado, preenchendo canceledAt', async () => {
    excursionRepository.findById.mockResolvedValue({
      id,
      organizationId,
      status: ExcursionStatus.OPEN,
    } as Excursion);
    excursionRepository.updateStatus.mockResolvedValue({
      id,
      status: ExcursionStatus.CANCELED,
    } as Excursion);

    await service.execute({
      organizationId,
      id,
      status: ExcursionStatus.CANCELED,
      cancelReason: 'Baixa demanda',
    });

    expect(excursionRepository.updateStatus).toHaveBeenCalledWith({
      id,
      status: ExcursionStatus.CANCELED,
      canceledAt: expect.any(Date),
      cancelReason: 'Baixa demanda',
    });
  });
});
