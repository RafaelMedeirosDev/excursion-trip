import { Event } from '@prisma/client';
import { EventRepository } from 'src/domain/EventRepository';
import { EventInvalidDateRange } from 'src/shared/erros/cases/EventInvalidDateRange';
import { CreateEventService } from './CreateEventService';

describe('CreateEventService', () => {
  let eventRepository: jest.Mocked<EventRepository>;
  let service: CreateEventService;

  const request = {
    organizationId: 'org-1',
    name: 'Réveillon 2027',
    address: 'Av. Beira Mar, 100',
    city: 'Florianópolis',
    state: 'SC' as const,
    startDate: '2027-01-01T00:00:00.000Z',
    endDate: '2027-01-02T00:00:00.000Z',
    startTime: '20:00',
    endTime: '06:00',
  };

  beforeEach(() => {
    eventRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };
    service = new CreateEventService(eventRepository);
  });

  it('cria o evento sem nenhuma checagem de duplicidade', async () => {
    eventRepository.create.mockResolvedValue({ id: 'event-1' } as Event);

    const result = await service.execute(request);

    expect(eventRepository.create).toHaveBeenCalledWith({
      organizationId: request.organizationId,
      name: request.name,
      address: request.address,
      city: request.city,
      state: request.state,
      startDate: new Date(request.startDate),
      endDate: new Date(request.endDate),
      startTime: request.startTime,
      endTime: request.endTime,
    });
    expect(result).toEqual({ id: 'event-1' });
  });

  it('lança EventInvalidDateRange quando endDate é antes de startDate', async () => {
    await expect(
      service.execute({
        ...request,
        startDate: '2027-01-02T00:00:00.000Z',
        endDate: '2027-01-01T00:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(EventInvalidDateRange);
    expect(eventRepository.create).not.toHaveBeenCalled();
  });
});
