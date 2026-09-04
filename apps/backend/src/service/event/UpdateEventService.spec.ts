import { Event, UF } from '@prisma/client';
import { EventRepository } from 'src/domain/EventRepository';
import { EventInvalidDateRange } from 'src/shared/erros/cases/EventInvalidDateRange';
import { EventNotFound } from 'src/shared/erros/cases/EventNotFound';
import { UpdateEventService } from './UpdateEventService';

describe('UpdateEventService', () => {
  let eventRepository: jest.Mocked<EventRepository>;
  let service: UpdateEventService;

  const existingEvent = {
    id: 'event-1',
    organizationId: 'org-1',
    name: 'Rock in Rio 2026',
    address: 'Parque Olímpico',
    city: 'Rio de Janeiro',
    state: UF.RJ,
    startDate: new Date('2026-09-18T00:00:00.000Z'),
    endDate: new Date('2026-09-27T00:00:00.000Z'),
    startTime: '14:00',
    endTime: '04:00',
  } as Event;

  const request = { organizationId: 'org-1', id: 'event-1' };

  beforeEach(() => {
    eventRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new UpdateEventService(eventRepository);
    eventRepository.findById.mockResolvedValue(existingEvent);
    eventRepository.update.mockResolvedValue({ id: 'event-1' } as Event);
  });

  it('atualiza somente os campos informados', async () => {
    const result = await service.execute({ ...request, name: 'Rock in Rio' });

    expect(eventRepository.update).toHaveBeenCalledWith({
      id: 'event-1',
      name: 'Rock in Rio',
      address: undefined,
      city: undefined,
      state: undefined,
      startDate: undefined,
      endDate: undefined,
      startTime: undefined,
      endTime: undefined,
    });
    expect(result).toEqual({ id: 'event-1' });
  });

  it('lança EventInvalidDateRange quando só o endDate vem, anterior ao startDate guardado', async () => {
    await expect(
      service.execute({ ...request, endDate: '2026-09-10' }),
    ).rejects.toBeInstanceOf(EventInvalidDateRange);
    expect(eventRepository.update).not.toHaveBeenCalled();
  });

  it('lança EventInvalidDateRange quando só o startDate vem, posterior ao endDate guardado', async () => {
    await expect(
      service.execute({ ...request, startDate: '2026-10-05' }),
    ).rejects.toBeInstanceOf(EventInvalidDateRange);
    expect(eventRepository.update).not.toHaveBeenCalled();
  });

  it('aceita as duas datas juntas quando coerentes', async () => {
    await service.execute({
      ...request,
      startDate: '2026-10-01',
      endDate: '2026-10-05',
    });

    expect(eventRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        startDate: new Date('2026-10-01'),
        endDate: new Date('2026-10-05'),
      }),
    );
  });

  it('aceita datas iguais (evento de um dia)', async () => {
    await service.execute({
      ...request,
      startDate: '2026-10-01',
      endDate: '2026-10-01',
    });

    expect(eventRepository.update).toHaveBeenCalled();
  });

  it('lança EventNotFound quando o evento não existe', async () => {
    eventRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ ...request, name: 'Novo' }),
    ).rejects.toBeInstanceOf(EventNotFound);
    expect(eventRepository.update).not.toHaveBeenCalled();
  });

  it('lança EventNotFound quando o evento é de outra organização', async () => {
    eventRepository.findById.mockResolvedValue({
      ...existingEvent,
      organizationId: 'org-2',
    } as Event);

    await expect(
      service.execute({ ...request, name: 'Novo' }),
    ).rejects.toBeInstanceOf(EventNotFound);
    expect(eventRepository.update).not.toHaveBeenCalled();
  });
});
