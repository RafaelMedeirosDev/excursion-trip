import { Event } from '@prisma/client';
import { EventRepository } from 'src/domain/EventRepository';
import { EventNotFound } from 'src/shared/erros/cases/EventNotFound';
import { GetEventService } from './GetEventService';

describe('GetEventService', () => {
  let eventRepository: jest.Mocked<EventRepository>;
  let service: GetEventService;

  const organizationId = 'org-1';
  const event = { id: 'event-1', organizationId } as Event;

  beforeEach(() => {
    eventRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    service = new GetEventService(eventRepository);
  });

  it('retorna o event quando pertence à organização', async () => {
    eventRepository.findById.mockResolvedValue(event);

    const result = await service.execute({ organizationId, id: 'event-1' });

    expect(result).toEqual(event);
  });

  it('lança EventNotFound quando o event não existe', async () => {
    eventRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({ organizationId, id: 'event-1' }),
    ).rejects.toBeInstanceOf(EventNotFound);
  });

  it('lança EventNotFound quando o event é de outra organização', async () => {
    eventRepository.findById.mockResolvedValue({
      ...event,
      organizationId: 'org-2',
    });

    await expect(
      service.execute({ organizationId, id: 'event-1' }),
    ).rejects.toBeInstanceOf(EventNotFound);
  });
});
