import {
  ExcursionRepository,
  Excursions,
} from 'src/domain/ExcursionRepository';
import { ListExcursionService } from './ListExcursionService';

describe('ListExcursionService', () => {
  let excursionRepository: jest.Mocked<ExcursionRepository>;
  let service: ListExcursionService;

  const organizationId = 'org-1';

  beforeEach(() => {
    excursionRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };
    service = new ListExcursionService(excursionRepository);
  });

  it('lista as excursions da organização informada, com o event incluído', async () => {
    const excursions = [
      { id: 'excursion-1', organizationId, event: { id: 'event-1' } },
    ] as Excursions[];
    excursionRepository.findAll.mockResolvedValue(excursions);

    const result = await service.execute({ organizationId });

    expect(excursionRepository.findAll).toHaveBeenCalledWith({
      organizationId,
    });
    expect(result).toEqual(excursions);
  });
});
