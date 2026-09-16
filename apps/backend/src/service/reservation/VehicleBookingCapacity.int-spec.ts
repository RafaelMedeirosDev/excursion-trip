import { ReservationStatus, Role } from '@prisma/client';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { PrismaExcursionRepository } from 'src/external/repositories/remote/PrismaExcursionRepository';
import { PrismaPaymentRepository } from 'src/external/repositories/remote/PrismaPaymentRepository';
import { PrismaRemoteRepository } from 'src/external/repositories/remote/PrismaRemoteRepository';
import { PrismaReservationRepository } from 'src/external/repositories/remote/PrismaReservationRepository';
import { PrismaVehicleBookingRepository } from 'src/external/repositories/remote/PrismaVehicleBookingRepository';
import { ConfirmReservationService } from 'src/service/reservation/ConfirmReservationService';
import { PendingReservationService } from 'src/service/reservation/PendingReservationService';
import { VehicleBookingCapacityExceeded } from 'src/shared/erros/cases/VehicleBookingCapacityExceeded';
import { Barrier } from 'src/test-support/barrier';
import { countOccupying, createCapacityScenario } from 'src/test-support/factories';
import { createTestClient } from 'src/test-support/prisma';
import { truncateAll } from 'src/test-support/truncate';

/**
 * Dois clients Prisma distintos = duas conexoes independentes, como duas
 * instancias do servidor atras de um load balancer veriam o banco. Um client so
 * com pool > 1 provavelmente bastaria, mas "provavelmente" e exatamente o que
 * este teste existe pra eliminar.
 */
let prismaA: PrismaRemoteRepository;
let prismaB: PrismaRemoteRepository;
/** Client neutro, so pra fixture e asercao — nunca participa da disputa. */
let prisma: PrismaRemoteRepository;

/**
 * Envolve o ReservationRepository real pra pendurar um hook no ponto exato da
 * janela de corrida: entre a leitura da ocupacao e a escrita do status.
 * Delega todo o resto — nao e mock, e decorator do objeto real.
 */
function withRaceHook(
  inner: ReservationRepository,
  afterCount: () => Promise<void>,
): ReservationRepository {
  return new Proxy(inner, {
    get(target, prop, receiver) {
      if (prop !== 'countActiveByVehicleBookingId') {
        return Reflect.get(target, prop, receiver);
      }

      return async (args: { vehicleBookingId: string }) => {
        const result = await target.countActiveByVehicleBookingId(args);
        await afterCount();
        return result;
      };
    },
  }) as ReservationRepository;
}

type Decorate = (repo: ReservationRepository) => ReservationRepository;

const identity: Decorate = (repo) => repo;

function buildPending(
  client: PrismaRemoteRepository,
  decorate: Decorate = identity,
): PendingReservationService {
  return new PendingReservationService(
    decorate(new PrismaReservationRepository(client)),
    new PrismaVehicleBookingRepository(client),
    new PrismaExcursionRepository(client),
    new PrismaPaymentRepository(client),
  );
}

function buildConfirm(
  client: PrismaRemoteRepository,
  decorate: Decorate = identity,
): ConfirmReservationService {
  return new ConfirmReservationService(
    decorate(new PrismaReservationRepository(client)),
    new PrismaVehicleBookingRepository(client),
    new PrismaExcursionRepository(client),
    new PrismaPaymentRepository(client),
  );
}

beforeAll(async () => {
  [prisma, prismaA, prismaB] = await Promise.all([
    createTestClient(),
    createTestClient(),
    createTestClient(),
  ]);
});

afterAll(async () => {
  // Sem isso o jest reclama que um worker nao encerrou.
  await Promise.all([
    prisma.$disconnect(),
    prismaA.$disconnect(),
    prismaB.$disconnect(),
  ]);
});

beforeEach(async () => {
  await truncateAll(prisma);
});

describe('capacidade do VehicleBooking sob concorrencia', () => {
  it('nao deixa duas promocoes simultaneas ocuparem a mesma ultima vaga', async () => {
    const scenario = await createCapacityScenario(prisma, {
      capacity: 3,
      occupied: 2, // 2 vagas tomadas -> sobra exatamente 1
      candidates: 2, // 2 reservas em WAITLIST disputando ela
    });

    // Timeout curto de proposito: depois da correcao a segunda chamada fica
    // presa no lock do banco e nunca chega aqui — a barreira expira, a primeira
    // commita, e a segunda le o estado ja atualizado.
    const barrier = new Barrier(2, 500);
    const hook: Decorate = (repo) => withRaceHook(repo, () => barrier.arrive());

    const request = {
      organizationId: scenario.organizationId,
      userId: scenario.userId,
      role: Role.ADM,
    };

    const results = await Promise.allSettled([
      buildPending(prismaA, hook).execute({
        ...request,
        id: scenario.candidateIds[0],
      }),
      buildPending(prismaB, hook).execute({
        ...request,
        id: scenario.candidateIds[1],
      }),
    ]);

    barrier.dispose();

    // A invariante e a asercao que importa: o veiculo nunca fica superlotado.
    expect(await countOccupying(prisma, scenario.vehicleBookingId)).toBeLessThanOrEqual(
      scenario.capacity,
    );

    // ...e exatamente uma das duas tem que ter falhado. Sem isto, o teste
    // passaria tambem no caso degenerado em que as DUAS falham.
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter(
      (r): r is PromiseRejectedResult => r.status === 'rejected',
    );

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    // Exigir o erro de DOMINIO (e nao um erro cru do Prisma) e uma restricao
    // deliberada sobre a correcao: o perdedor recebe 400, nao 500.
    expect(rejected[0].reason).toBeInstanceOf(VehicleBookingCapacityExceeded);
  });

  it('mantem a invariante quando Pending e Confirm disputam a mesma vaga', async () => {
    const scenario = await createCapacityScenario(prisma, {
      capacity: 2,
      occupied: 1,
      candidates: 2,
    });

    const barrier = new Barrier(2, 500);
    const hook: Decorate = (repo) => withRaceHook(repo, () => barrier.arrive());

    const request = {
      organizationId: scenario.organizationId,
      userId: scenario.userId,
      role: Role.ADM,
    };

    const results = await Promise.allSettled([
      buildPending(prismaA, hook).execute({
        ...request,
        id: scenario.candidateIds[0],
      }),
      buildConfirm(prismaB, hook).execute({
        ...request,
        id: scenario.candidateIds[1],
      }),
    ]);

    barrier.dispose();

    expect(await countOccupying(prisma, scenario.vehicleBookingId)).toBeLessThanOrEqual(
      scenario.capacity,
    );
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])(
    'mantem a invariante com 4 disputantes para 1 vaga (rodada %i)',
    async () => {
      // Sem instrumentacao nenhuma: puro Promise.all. Sobre-contencao (4 pra 1)
      // e repeticao no lugar da barreira. Sobrevive a refatoracoes que mudem o
      // formato interno do Service, que o teste de barreira nao pegaria.
      const scenario = await createCapacityScenario(prisma, {
        capacity: 1,
        candidates: 4,
      });

      const clients = [prismaA, prismaB, prismaA, prismaB];
      const request = {
        organizationId: scenario.organizationId,
        userId: scenario.userId,
        role: Role.ADM,
      };

      const results = await Promise.allSettled(
        scenario.candidateIds.map((id, index) =>
          buildPending(clients[index]).execute({ ...request, id }),
        ),
      );

      expect(await countOccupying(prisma, scenario.vehicleBookingId)).toBeLessThanOrEqual(1);
      expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    },
  );

  it('nao promove alem da capacidade quando dois pagamentos chegam juntos', async () => {
    // CreatePaymentService nunca lanca — so deixa de promover. Entao aqui so a
    // invariante pode ser asserida, e e justamente o caminho mais facil de
    // esquecer e o mais dificil de perceber em producao.
    const scenario = await createCapacityScenario(prisma, {
      capacity: 1,
      candidates: 2,
    });

    const results = await Promise.allSettled(
      scenario.candidateIds.map((id) =>
        buildPending(prismaA).execute({
          organizationId: scenario.organizationId,
          userId: scenario.userId,
          role: Role.ADM,
          id,
        }),
      ),
    );

    expect(await countOccupying(prisma, scenario.vehicleBookingId)).toBeLessThanOrEqual(1);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  });

  it('nao permite que uma promocao ressuscite uma reserva cancelada', async () => {
    const scenario = await createCapacityScenario(prisma, {
      capacity: 5,
      candidates: 1,
    });
    const [id] = scenario.candidateIds;

    // Cancela e so depois promove: a promocao tem que recusar, porque CANCELED
    // e terminal. Hoje o updateStatus nao tem condicao de status no where.
    await prisma.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELED, canceledAt: new Date() },
    });

    await expect(
      buildPending(prismaA).execute({
        organizationId: scenario.organizationId,
        userId: scenario.userId,
        role: Role.ADM,
        id,
      }),
    ).rejects.toThrow();

    const reservation = await prisma.reservation.findUniqueOrThrow({ where: { id } });
    expect(reservation.status).toBe(ReservationStatus.CANCELED);
  });
});
