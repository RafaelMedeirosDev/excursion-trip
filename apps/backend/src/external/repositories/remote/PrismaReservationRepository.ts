import { Injectable } from '@nestjs/common';
import {
  ExcursionStatus,
  Reservation,
  ReservationStatus,
} from '@prisma/client';
import {
  Create,
  CountActiveByVehicleBookingId,
  CountUpcomingByCustomerId,
  FindActiveByEventAndCustomer,
  FindAll,
  FindAllPaginated,
  FindById,
  PaginatedReservations,
  ReservationRepository,
  Reservations,
  UpdateStatus,
  UpdateStatusWithinCapacity,
  UpdateStatusWithinCapacityResult,
} from 'src/domain/ReservationRepository';
import { PrismaRemoteRepository } from './PrismaRemoteRepository';

const RESERVATION_SELECT = {
  id: true,
  organizationId: true,
  userId: true,
  customerId: true,
  vehicleBookingId: true,
  boardingPointId: true,
  status: true,
  agreedValue: true,
  canceledAt: true,
  cancelReason: true,
  createdAt: true,
  updatedAt: true,
  customer: {
    select: {
      id: true,
      organizationId: true,
      name: true,
      email: true,
      phone: true,
      cpf: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  vehicleBooking: {
    select: {
      id: true,
      organizationId: true,
      supplierId: true,
      excursionId: true,
      userId: true,
      vehicleType: true,
      plate: true,
      capacity: true,
      value: true,
      startTime: true,
      returnTime: true,
      price: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  boardingPoint: {
    select: {
      id: true,
      organizationId: true,
      vehicleBookingId: true,
      address: true,
      time: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  user: {
    select: {
      id: true,
      organizationId: true,
      name: true,
      email: true,
      phone: true,
      cpf: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} as const;

@Injectable()
export class PrismaReservationRepository implements ReservationRepository {
  constructor(private readonly repository: PrismaRemoteRepository) {}

  create({
    organizationId,
    userId,
    customerId,
    vehicleBookingId,
    boardingPointId,
    agreedValue,
  }: Create): Promise<Reservation> {
    return this.repository.reservation.create({
      data: {
        organizationId,
        userId,
        customerId,
        vehicleBookingId,
        boardingPointId,
        agreedValue,
      },
    });
  }

  findActiveByEventAndCustomer({
    eventId,
    customerId,
  }: FindActiveByEventAndCustomer): Promise<Reservation | null> {
    return this.repository.reservation.findFirst({
      where: {
        customerId,
        status: { not: ReservationStatus.CANCELED },
        vehicleBooking: { excursion: { eventId } },
      },
    });
  }

  findById({ id }: FindById): Promise<Reservation | null> {
    return this.repository.reservation.findUnique({ where: { id } });
  }

  // "upcoming" = reserva não cancelada em excursão que ainda não terminou.
  // Nome diferente de countActiveByVehicleBookingId de propósito: lá "active"
  // significa ocupar vaga (PENDING/CONFIRMED), critério totalmente outro.
  countUpcomingByCustomerId({
    customerId,
  }: CountUpcomingByCustomerId): Promise<number> {
    return this.repository.reservation.count({
      where: {
        customerId,
        status: { not: ReservationStatus.CANCELED },
        vehicleBooking: {
          excursion: {
            status: {
              notIn: [ExcursionStatus.DONE, ExcursionStatus.CANCELED],
            },
          },
        },
      },
    });
  }

  countActiveByVehicleBookingId({
    vehicleBookingId,
  }: CountActiveByVehicleBookingId): Promise<number> {
    return this.repository.reservation.count({
      where: {
        vehicleBookingId,
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
      },
    });
  }

  findAll({
    organizationId,
    userId,
    status,
    vehicleBookingId,
  }: FindAll): Promise<Reservations[]> {
    return this.repository.reservation.findMany({
      where: {
        organizationId,
        deletedAt: null,
        ...(status ? { status } : {}),
        ...(vehicleBookingId ? { vehicleBookingId } : {}),
        ...(userId && !vehicleBookingId
          ? { OR: [{ userId }, { vehicleBooking: { userId } }] }
          : {}),
      },
      select: RESERVATION_SELECT,
    });
  }

  findAllPaginated({
    organizationId,
    userId,
    status,
    query,
    page,
    limit,
  }: FindAllPaginated): Promise<PaginatedReservations> {
    // Dois OR independentes que precisam conviver: o escopo por linha (o que o
    // funcionario pode ver) e a busca textual. Eles vao em ramos separados de um
    // AND, e nao espalhados no mesmo literal — spread repetiria a chave `OR` e a
    // ultima venceria em silencio. Se a perdida fosse a do escopo, o funcionario
    // passaria a ver a organizacao inteira ao digitar qualquer coisa na busca:
    // sem erro de tipo, sem erro do Prisma, sem teste vermelho.
    const filters = [];

    if (userId) {
      filters.push({ OR: [{ userId }, { vehicleBooking: { userId } }] });
    }

    if (query) {
      filters.push({
        OR: [
          {
            vehicleBooking: {
              excursion: {
                event: {
                  name: { contains: query, mode: 'insensitive' as const },
                },
              },
            },
          },
          {
            customer: {
              name: { contains: query, mode: 'insensitive' as const },
            },
          },
          // CPF sem `mode`: e numerico, mesmo criterio de Customer/User/Supplier
          { customer: { cpf: { contains: query } } },
        ],
      });
    }

    const where = {
      organizationId,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(filters.length ? { AND: filters } : {}),
    };

    return Promise.all([
      this.repository.reservation.findMany({
        where,
        select: RESERVATION_SELECT,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.repository.reservation.count({ where }),
    ]).then(([data, total]) => ({ data, total, page, limit }));
  }

  async updateStatusWithinCapacity({
    id,
    fromStatuses,
    toStatus,
    occupyingStatuses,
  }: UpdateStatusWithinCapacity): Promise<UpdateStatusWithinCapacityResult> {
    return this.repository.$transaction(async (tx) => {
      // Trava a linha do VehicleBooking: ela e o mutex da concessao de vaga
      // desse veiculo. Lock de linha vale mesmo numa linha so lida, e dura ate
      // o commit.
      //
      // FOR NO KEY UPDATE e nao FOR UPDATE: todo INSERT de Reservation tira
      // FOR KEY SHARE nessa mesma linha por causa da FK, e FOR UPDATE
      // conflitaria com ele — uma promocao em curso bloquearia toda criacao de
      // reserva no veiculo. FOR NO KEY UPDATE conflita so consigo mesmo, que e
      // exatamente a exclusao mutua que precisamos.
      //
      // O JOIN resolve o vehicleBookingId sem um SELECT extra; essa coluna
      // nunca e atualizada, entao le-la junto do lock e seguro.
      const locked = await tx.$queryRaw<{ id: string; capacity: number }[]>`
        SELECT vb."id", vb."capacity"
        FROM "VehicleBooking" vb
        INNER JOIN "Reservation" r ON r."vehicleBookingId" = vb."id"
        WHERE r."id" = ${id}
        FOR NO KEY UPDATE OF vb
      `;

      if (locked.length === 0) {
        return { ok: false, reason: 'NOT_FOUND' };
      }

      const { id: vehicleBookingId, capacity } = locked[0];

      if (occupyingStatuses.includes(toStatus)) {
        // Exclui a propria reserva: se ela JA ocupa (PENDING -> CONFIRMED), a
        // transicao nao consome vaga nova e a checagem passa sozinha. Mesmo
        // criterio de countActiveByVehicleBookingId.
        const occupied = await tx.reservation.count({
          where: {
            vehicleBookingId,
            id: { not: id },
            status: { in: occupyingStatuses },
          },
        });

        if (occupied >= capacity) {
          return { ok: false, reason: 'CAPACITY_EXCEEDED' };
        }
      }

      // O status entra no where: se outra transacao mexeu na reserva enquanto
      // esperavamos o lock (um cancelamento, por exemplo), count = 0 e a
      // promocao nao acontece. E o que fecha o last-write-wins do updateStatus.
      const { count } = await tx.reservation.updateMany({
        where: { id, status: { in: fromStatuses } },
        data: { status: toStatus },
      });

      if (count === 0) {
        return { ok: false, reason: 'STATUS_CHANGED' };
      }

      const reservation = await tx.reservation.findUniqueOrThrow({
        where: { id },
      });

      return { ok: true, reservation };
    });
  }

  updateStatus({
    id,
    status,
    canceledAt,
    cancelReason,
  }: UpdateStatus): Promise<Reservation> {
    return this.repository.reservation.update({
      where: { id },
      data: { status, canceledAt, cancelReason },
    });
  }
}
