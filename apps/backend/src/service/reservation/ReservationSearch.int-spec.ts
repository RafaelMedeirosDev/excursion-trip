import { ReservationStatus, Role } from '@prisma/client';
import { PrismaRemoteRepository } from 'src/external/repositories/remote/PrismaRemoteRepository';
import { PrismaReservationRepository } from 'src/external/repositories/remote/PrismaReservationRepository';
import { ListPaginatedReservationService } from 'src/service/reservation/ListPaginatedReservationService';
import { createSearchScenario } from 'src/test-support/factories';
import { createTestClient } from 'src/test-support/prisma';
import { truncateAll } from 'src/test-support/truncate';

let prisma: PrismaRemoteRepository;
let service: ListPaginatedReservationService;

beforeAll(async () => {
  prisma = await createTestClient();
  // Repositorio Prisma real: o `where` desta busca e justamente o que os specs
  // unitarios nunca executam, porque mockam o repositorio.
  service = new ListPaginatedReservationService(
    new PrismaReservationRepository(prisma),
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await truncateAll(prisma);
});

async function cenario() {
  return createSearchScenario(prisma, {
    reservations: [
      {
        customerName: 'Ana Beatriz Ramos',
        customerCpf: '11122233344',
        eventName: 'Festival Rio Live',
        status: ReservationStatus.CONFIRMED,
      },
      {
        customerName: 'Bruno Carvalho',
        customerCpf: '55566677788',
        eventName: 'Festival Sertao Vivo',
        status: ReservationStatus.WAITLIST,
      },
    ],
  });
}

describe('busca da listagem paginada de reservas', () => {
  it('encontra pelo nome do cliente', async () => {
    const { organizationId, admId } = await cenario();

    const result = await service.execute({
      organizationId,
      userId: admId,
      role: Role.ADM,
      query: 'beatriz',
    });

    expect(result.total).toBe(1);
    expect(result.data[0].customer.name).toBe('Ana Beatriz Ramos');
  });

  it('encontra pelo CPF, inclusive parcial', async () => {
    const { organizationId, admId } = await cenario();

    const result = await service.execute({
      organizationId,
      userId: admId,
      role: Role.ADM,
      query: '555666',
    });

    expect(result.total).toBe(1);
    expect(result.data[0].customer.cpf).toBe('55566677788');
  });

  it('continua encontrando pelo nome do evento', async () => {
    const { organizationId, admId } = await cenario();

    const result = await service.execute({
      organizationId,
      userId: admId,
      role: Role.ADM,
      query: 'sertao',
    });

    expect(result.total).toBe(1);
    expect(result.data[0].customer.name).toBe('Bruno Carvalho');
  });

  // ESTE e o teste que justifica o AND no `where`. Com dois OR espalhados no
  // mesmo literal, o escopo por linha seria sobrescrito e este caso passaria a
  // devolver a reserva do outro funcionario.
  it('nao deixa o funcionario achar a reserva de outro funcionario pela busca', async () => {
    const { organizationId, reservations } = await cenario();
    const [primeira, segunda] = reservations;

    const result = await service.execute({
      organizationId,
      userId: primeira.userId,
      role: Role.EMPLOYEE,
      query: segunda.customerName, // busca o cliente que NAO e dele
    });

    expect(result.total).toBe(0);
    expect(result.data).toHaveLength(0);
  });

  it('o funcionario continua achando a propria reserva pela busca', async () => {
    const { organizationId, reservations } = await cenario();
    const [primeira] = reservations;

    const result = await service.execute({
      organizationId,
      userId: primeira.userId,
      role: Role.EMPLOYEE,
      query: primeira.customerName,
    });

    expect(result.total).toBe(1);
    expect(result.data[0].id).toBe(primeira.reservationId);
  });

  it('combina busca com filtro de status, sem um substituir o outro', async () => {
    const { organizationId, admId } = await cenario();

    // "Festival" casa com os dois eventos; o status desempata
    const confirmadas = await service.execute({
      organizationId,
      userId: admId,
      role: Role.ADM,
      query: 'Festival',
      status: ReservationStatus.CONFIRMED,
    });

    expect(confirmadas.total).toBe(1);
    expect(confirmadas.data[0].customer.name).toBe('Ana Beatriz Ramos');

    const semStatus = await service.execute({
      organizationId,
      userId: admId,
      role: Role.ADM,
      query: 'Festival',
    });

    expect(semStatus.total).toBe(2);
  });

  it('sem busca, o ADM vê tudo e o funcionário só o que é dele', async () => {
    const { organizationId, admId, reservations } = await cenario();

    const comoAdm = await service.execute({
      organizationId,
      userId: admId,
      role: Role.ADM,
    });
    expect(comoAdm.total).toBe(2);

    const comoEmployee = await service.execute({
      organizationId,
      userId: reservations[0].userId,
      role: Role.EMPLOYEE,
    });
    expect(comoEmployee.total).toBe(1);
  });
});
