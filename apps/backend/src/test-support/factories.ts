import { randomUUID } from 'node:crypto';
import {
  ExcursionStatus,
  PaymentMethod,
  PaymentType,
  PrismaClient,
  ReservationStatus,
  Role,
  UF,
} from '@prisma/client';

export interface CapacityScenario {
  organizationId: string;
  userId: string;
  vehicleBookingId: string;
  capacity: number;
  /** Reservas em WAITLIST que vao disputar a(s) vaga(s) restante(s). */
  candidateIds: string[];
}

interface CapacityScenarioInput {
  capacity: number;
  /** Quantas reservas ja ocupam vaga (criadas direto como CONFIRMED). */
  occupied?: number;
  /** Quantas reservas em WAITLIST vao disputar. */
  candidates: number;
  agreedValue?: number;
}

// centavos, como todo campo monetario do projeto. Diferente de zero de
// proposito: com 0 a comparacao `0 >= 0` dos gates de pagamento passaria por
// acidente, e o teste ficaria verde sem exercitar a regra.
const AGREED_VALUE = 20_000;

/**
 * Menor grafo que faz os Services de transicao chegarem ate a checagem de
 * capacidade sem morrer antes em outro guard: a excursao precisa estar fora de
 * DONE/CANCELED e a reserva precisa ter pagamento suficiente.
 *
 * Sem bcrypt (hash literal) — nada aqui faz login.
 */
export async function createCapacityScenario(
  prisma: PrismaClient,
  {
    capacity,
    occupied = 0,
    candidates,
    agreedValue = AGREED_VALUE,
  }: CapacityScenarioInput,
): Promise<CapacityScenario> {
  const organization = await prisma.organization.create({
    data: { name: 'Org de teste' },
  });

  const user = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: 'ADM de teste',
      email: `adm-${randomUUID()}@test.local`, // User.email e unique global
      password: 'nao-e-um-hash-real',
      phone: '11999999999',
      cpf: randomUUID().slice(0, 11),
      role: Role.ADM, // ADM evita os guards de dono nos Services
    },
  });

  const supplier = await prisma.supplier.create({
    data: {
      organizationId: organization.id,
      name: 'Fornecedor de teste',
      cnpj: randomUUID().slice(0, 14),
      phone: '1133333333',
    },
  });

  const event = await prisma.event.create({
    data: {
      organizationId: organization.id,
      name: 'Evento de teste',
      address: 'Rua 1',
      city: 'Sao Paulo',
      state: UF.SP,
      startDate: new Date('2030-01-10'),
      endDate: new Date('2030-01-11'),
      startTime: '08:00',
      endTime: '18:00',
    },
  });

  const excursion = await prisma.excursion.create({
    data: {
      organizationId: organization.id,
      eventId: event.id,
      userId: user.id,
      name: 'Excursao de teste',
      departureDate: new Date('2030-01-09'),
      returnDate: new Date('2030-01-12'),
      status: ExcursionStatus.OPEN, // PLANNING/OPEN passam nos guards
    },
  });

  const vehicleBooking = await prisma.vehicleBooking.create({
    data: {
      organizationId: organization.id,
      supplierId: supplier.id,
      excursionId: excursion.id,
      userId: user.id,
      vehicleType: 'ONIBUS',
      plate: null, // @@unique([excursionId, plate]) — NULLs nao colidem no PG
      capacity,
      value: 100_000,
      price: agreedValue,
    },
  });

  const makeReservation = async (
    status: ReservationStatus,
  ): Promise<string> => {
    const customer = await prisma.customer.create({
      data: {
        organizationId: organization.id,
        name: `Cliente ${randomUUID().slice(0, 8)}`,
        phone: '11988888888',
        cpf: randomUUID().slice(0, 11), // @@unique([organizationId, cpf])
      },
    });

    const reservation = await prisma.reservation.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        customerId: customer.id,
        vehicleBookingId: vehicleBooking.id,
        status,
        agreedValue,
      },
    });

    // Pagamento integral: satisfaz o gate de 50% do Pending e o de 100% do
    // Confirm, entao a mesma fixture serve aos dois Services.
    await prisma.payment.create({
      data: {
        organizationId: organization.id,
        reservationId: reservation.id,
        userId: user.id,
        type: PaymentType.PAYMENT,
        value: agreedValue,
        method: PaymentMethod.PIX,
      },
    });

    return reservation.id;
  };

  for (let i = 0; i < occupied; i += 1) {
    await makeReservation(ReservationStatus.CONFIRMED);
  }

  const candidateIds: string[] = [];

  for (let i = 0; i < candidates; i += 1) {
    candidateIds.push(await makeReservation(ReservationStatus.WAITLIST));
  }

  return {
    organizationId: organization.id,
    userId: user.id,
    vehicleBookingId: vehicleBooking.id,
    capacity,
    candidateIds,
  };
}

export function countOccupying(
  prisma: PrismaClient,
  vehicleBookingId: string,
): Promise<number> {
  return prisma.reservation.count({
    where: {
      vehicleBookingId,
      status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED] },
    },
  });
}
