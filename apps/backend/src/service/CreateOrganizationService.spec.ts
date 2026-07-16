import { Organization } from '@prisma/client';
import { OrganizationRepository } from 'src/domain/OrganizationRepository';
import { OrganizationAlreadyExists } from 'src/shared/erros/cases/OrganizationAlreadyExists';
import { CreateOrganizationService } from './CreateOrganizationService';

describe('CreateOrganizationService', () => {
  let organizationRepository: jest.Mocked<OrganizationRepository>;
  let service: CreateOrganizationService;

  beforeEach(() => {
    organizationRepository = {
      create: jest.fn(),
      findByCnpj: jest.fn(),
    };
    service = new CreateOrganizationService(organizationRepository);
  });

  it('cria a organização quando o cnpj não é informado', async () => {
    organizationRepository.create.mockResolvedValue({
      id: 'org-1',
    } as Organization);

    const result = await service.execute({ name: 'Excursões Sul' });

    expect(organizationRepository.findByCnpj).not.toHaveBeenCalled();
    expect(organizationRepository.create).toHaveBeenCalledWith({
      name: 'Excursões Sul',
      cnpj: undefined,
    });
    expect(result).toEqual({ id: 'org-1' });
  });

  it('cria a organização quando o cnpj informado ainda não existe', async () => {
    organizationRepository.findByCnpj.mockResolvedValue(null);
    organizationRepository.create.mockResolvedValue({
      id: 'org-1',
    } as Organization);

    await service.execute({ name: 'Excursões Sul', cnpj: '12345678000100' });

    expect(organizationRepository.findByCnpj).toHaveBeenCalledWith({
      cnpj: '12345678000100',
    });
    expect(organizationRepository.create).toHaveBeenCalled();
  });

  it('lança OrganizationAlreadyExists quando o cnpj já existe', async () => {
    organizationRepository.findByCnpj.mockResolvedValue({
      id: 'org-existente',
    } as Organization);

    await expect(
      service.execute({ name: 'Excursões Sul', cnpj: '12345678000100' }),
    ).rejects.toBeInstanceOf(OrganizationAlreadyExists);
    expect(organizationRepository.create).not.toHaveBeenCalled();
  });
});
