import { Reservation, Role } from '@prisma/client';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { ReservationNotFound } from 'src/shared/erros/cases/ReservationNotFound';
import { GetReservationService } from './GetReservationService';

describe('GetReservationService', () => {
  let reservationRepository: jest.Mocked<ReservationRepository>;
  let service: GetReservationService;

  const organizationId = 'org-1';
  const userId = 'user-1';
  const reservation = {
    id: 'reservation-1',
    organizationId,
    userId,
  } as Reservation;

  beforeEach(() => {
    reservationRepository = {
      create: jest.fn(),
      findActiveByEventAndCustomer: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };
    service = new GetReservationService(reservationRepository);
  });

  it('ADM: retorna a reservation mesmo não sendo o próprio userId', async () => {
    reservationRepository.findById.mockResolvedValue(reservation);

    const result = await service.execute({
      organizationId,
      id: 'reservation-1',
      userId: 'outro-user',
      role: Role.ADM,
    });

    expect(result).toEqual(reservation);
  });

  it('EMPLOYEE: retorna a reservation quando é o dono', async () => {
    reservationRepository.findById.mockResolvedValue(reservation);

    const result = await service.execute({
      organizationId,
      id: 'reservation-1',
      userId,
      role: Role.EMPLOYEE,
    });

    expect(result).toEqual(reservation);
  });

  it('EMPLOYEE: lança ReservationNotFound quando a reservation é de outro usuário', async () => {
    reservationRepository.findById.mockResolvedValue(reservation);

    await expect(
      service.execute({
        organizationId,
        id: 'reservation-1',
        userId: 'outro-user',
        role: Role.EMPLOYEE,
      }),
    ).rejects.toBeInstanceOf(ReservationNotFound);
  });

  it('lança ReservationNotFound quando a reservation não existe', async () => {
    reservationRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute({
        organizationId,
        id: 'reservation-1',
        userId,
        role: Role.ADM,
      }),
    ).rejects.toBeInstanceOf(ReservationNotFound);
  });

  it('lança ReservationNotFound quando a reservation é de outra organização', async () => {
    reservationRepository.findById.mockResolvedValue({
      ...reservation,
      organizationId: 'org-2',
    });

    await expect(
      service.execute({
        organizationId,
        id: 'reservation-1',
        userId,
        role: Role.ADM,
      }),
    ).rejects.toBeInstanceOf(ReservationNotFound);
  });
});
