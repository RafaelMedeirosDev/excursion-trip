import { EventRepository, Events } from 'src/domain/EventRepository';
import { ListEventService } from './ListEventService';

describe('ListEventService', () => {
  let eventRepository: jest.Mocked<EventRepository>;
  let service: ListEventService;

  const organizationId = 'org-1';

  beforeEach(() => {
    eventRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    service = new ListEventService(eventRepository);
  });

  it('lista os events da organização informada', async () => {
    const events = [{ id: 'event-1', organizationId }] as Events[];
    eventRepository.findAll.mockResolvedValue(events);

    const result = await service.execute({ organizationId });

    expect(eventRepository.findAll).toHaveBeenCalledWith({ organizationId });
    expect(result).toEqual(events);
  });
});
