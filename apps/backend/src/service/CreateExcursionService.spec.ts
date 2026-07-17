import { Excursion, Event } from '@prisma/client';
import { EventRepository } from 'src/domain/EventRepository';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { EventNotFound } from 'src/shared/erros/cases/EventNotFound';
import { CreateExcursionService } from './CreateExcursionService';

describe('CreateExcursionService', () => {
  let excursionRepository: jest.Mocked<ExcursionRepository>;
  let eventRepository: jest.Mocked<EventRepository>;
  let service: CreateExcursionService;

  const organizationId = 'org-1';

  const request = {
    organizationId,
    userId: 'user-1',
    eventId: 'event-1',
    name: 'Excursão Réveillon 2027',
    departureDate: '2027-01-01T00:00:00.000Z',
    returnDate: '2027-01-02T00:00:00.000Z',
  };

  beforeEach(() => {
    excursionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
    };
    eventRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    service = new CreateExcursionService(excursionRepository, eventRepository);
  });

  it('cria a excursão quando o evento existe na mesma organização', async () => {
    eventRepository.findById.mockResolvedValue({
      id: request.eventId,
      organizationId,
    } as Event);
    excursionRepository.create.mockResolvedValue({
      id: 'excursion-1',
    } as Excursion);

    const result = await service.execute(request);

    expect(eventRepository.findById).toHaveBeenCalledWith({
      id: request.eventId,
    });
    expect(excursionRepository.create).toHaveBeenCalledWith({
      organizationId,
      eventId: request.eventId,
      userId: request.userId,
      name: request.name,
      departureDate: new Date(request.departureDate),
      returnDate: new Date(request.returnDate),
    });
    expect(result).toEqual({ id: 'excursion-1' });
  });

  it('lança EventNotFound quando o evento não existe', async () => {
    eventRepository.findById.mockResolvedValue(null);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      EventNotFound,
    );
    expect(excursionRepository.create).not.toHaveBeenCalled();
  });

  it('lança EventNotFound quando o evento é de outra organização', async () => {
    eventRepository.findById.mockResolvedValue({
      id: request.eventId,
      organizationId: 'org-2',
    } as Event);

    await expect(service.execute(request)).rejects.toBeInstanceOf(
      EventNotFound,
    );
    expect(excursionRepository.create).not.toHaveBeenCalled();
  });
});
