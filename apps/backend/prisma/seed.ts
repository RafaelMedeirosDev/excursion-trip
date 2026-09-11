/**
 * Seed da organização de DEMONSTRAÇÃO.
 *
 * Cria uma organização própria, com id fixo, povoada com dados realistas para
 * alguém de fora conhecer o sistema. É seguro rodar em produção: tudo é
 * escopado pelo id da demo e nenhuma outra organização é lida ou alterada.
 *
 *   pnpm --filter @excursion-trip/backend db:seed
 *   SEED_RESET=1 pnpm --filter @excursion-trip/backend db:seed   # restaura do zero
 *
 * Em desenvolvimento, os dados ficam na organização da demo — entre com as
 * credenciais impressas no fim da execução. Para ver os mesmos dados com uma
 * conta sua já existente, mova-a para a demo:
 *
 *   UPDATE "User" SET "organizationId" = '0a000000-0000-4000-8000-000000000001'
 *   WHERE email = '<o seu e-mail>';
 */
import {
  ExcursionStatus,
  ExpensesCategory,
  PaymentMethod,
  PaymentType,
  PrismaClient,
  ReservationStatus,
  Role,
  UF,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const DEMO_PASSWORD = 'demo1234';

// Identidade da organização de demonstração. É um literal de propósito: é ele
// que delimita o escopo do modo de reset, e derivar identidade de uma query foi
// justamente o que fazia este seed adotar a organização real em produção.
const DEMO_ORGANIZATION_ID = '0a000000-0000-4000-8000-000000000001';
const DEMO_ORGANIZATION_NAME = 'Excursões Panorama — Demo';

// Ids fixos (UUID v4 válido) — é o que torna o seed idempotente: rodar de novo
// faz update das mesmas linhas, não duplica.
const uid = (prefix: string, n: number) =>
  `${prefix}-0000-4000-8000-${String(n).padStart(12, '0')}`;

// User/Supplier/Customer também usam id fixo, e não a chave natural (email,
// cnpj, cpf): PATCH /users/:id, /customers/:id e /suppliers/:id existem e quem
// visita a demo é ADM. Se ele editar um desses campos, casar por chave natural
// faria o próximo seed criar uma duplicata em vez de corrigir a linha.
const userId = (n: number) => uid('c0000000', n);
const supplierId = (n: number) => uid('5f000000', n);
const customerId = (n: number) => uid('0c000000', n);
const eventId = (n: number) => uid('ee000000', n);
const excursionId = (n: number) => uid('ec000000', n);
const vehicleId = (n: number) => uid('bc000000', n);
const boardingId = (n: number) => uid('b0000000', n);
const reservationId = (n: number) => uid('a5000000', n);
const paymentId = (n: number) => uid('fa000000', n);
const expenseId = (n: number) => uid('de000000', n);

// ---------- Datas relativas ----------
// Tudo deriva de "hoje 00:00 UTC" pra demo nunca envelhecer: com datas fixas, o
// Dashboard (que separa eventos em Próximos/Realizados comparando com `now`)
// acabaria sem nenhum evento futuro. UTC explícito em todos os helpers porque
// `setHours(0,0,0,0)` daria um dia diferente numa máquina em UTC-3 e no
// container do Railway em UTC.
const startOfTodayUTC = () => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
};

const TODAY = startOfTodayUTC();

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

const daysFromNow = (days: number) => addDays(TODAY, days);

// Clampa o dia no último dia do mês alvo: sem isso, 31/01 + 1 mês transbordaria
// silenciosamente para 03/03.
const monthsFromNow = (months: number) => {
  const target = new Date(
    Date.UTC(TODAY.getUTCFullYear(), TODAY.getUTCMonth() + months, 1),
  );
  const lastDayOfTargetMonth = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(TODAY.getUTCDate(), lastDayOfTargetMonth));
  return target;
};

// O domínio exige startDate <= endDate (Event) e departureDate <= returnDate
// (Excursion), mas o seed escreve direto no Prisma, sem passar pelos Services —
// nada valida isso sozinho.
const assertRange = (label: string, start: Date, end: Date) => {
  if (start.getTime() > end.getTime()) {
    throw new Error(
      `[seed] intervalo inválido em "${label}": ${start.toISOString()} > ${end.toISOString()}`,
    );
  }
};

// Âncoras dos 3 eventos. Todas as outras datas são addDays() a partir daqui, o
// que mantém as invariantes de intervalo por construção.
const PAST_EVENT_START = monthsFromNow(-3);
const NEAR_EVENT_START = monthsFromNow(1);
const FAR_EVENT_START = monthsFromNow(4);

// ---------- Reset (opt-in) ----------
// Único caminho destrutivo do arquivo. Apaga tudo da organização de demo antes
// de semear de novo, pra restaurar o estado inicial mesmo depois de alguém ter
// criado/excluído registros pela interface.
// Nunca colocar SEED_RESET no .env: o CLI do Prisma carrega o .env antes do
// seed, e um valor esquecido lá tornaria toda execução destrutiva.
async function resetDemoOrganization(organizationId: string) {
  if (organizationId !== DEMO_ORGANIZATION_ID) {
    throw new Error(
      `[seed] Reset abortado: ${organizationId} não é a organização de demonstração.`,
    );
  }

  const where = { organizationId };

  // Ordem topológica das FKs, folhas primeiro. A ordem importa por um motivo
  // silencioso: nas relações opcionais (Reservation.boardingPointId,
  // Expense.vehicleBookingId) o default do Prisma é SetNull, então apagar fora
  // de ordem não daria erro — apenas zeraria campos sem avisar.
  const [
    payments,
    reservations,
    expenses,
    boardingPoints,
    vehicleBookings,
    excursions,
    events,
    customers,
    suppliers,
    refreshTokens,
    users,
  ] = await prisma.$transaction([
    prisma.payment.deleteMany({ where }),
    prisma.reservation.deleteMany({ where }),
    prisma.expense.deleteMany({ where }),
    prisma.boardingPoint.deleteMany({ where }),
    prisma.vehicleBooking.deleteMany({ where }),
    prisma.excursion.deleteMany({ where }),
    prisma.event.deleteMany({ where }),
    prisma.customer.deleteMany({ where }),
    prisma.supplier.deleteMany({ where }),
    // RefreshToken não tem organizationId nem onDelete: Cascade — sem escopar
    // pela relação, o delete dos usuários que já logaram falha por FK.
    prisma.refreshToken.deleteMany({ where: { user: { organizationId } } }),
    prisma.user.deleteMany({ where }),
  ]);

  // A própria Organization não é apagada: ela é o contêiner e preserva o id fixo.
  console.log('Reset da organização de demonstração:');
  console.log(`  ${users.count} usuários, ${refreshTokens.count} sessões`);
  console.log(`  ${suppliers.count} fornecedores, ${customers.count} clientes`);
  console.log(`  ${events.count} eventos, ${excursions.count} excursões`);
  console.log(
    `  ${vehicleBookings.count} veículos, ${boardingPoints.count} pontos de embarque`,
  );
  console.log(
    `  ${reservations.count} reservas, ${payments.count} pagamentos, ${expenses.count} despesas`,
  );
}

async function main() {
  // ---------- Organization ----------
  // Organização própria da demonstração, com id fixo. Nunca adota uma
  // organização existente: em produção isso injetaria os dados fictícios dentro
  // do tenant real.
  // `cnpj` fica null de propósito — o campo é @unique GLOBAL e no Postgres
  // vários NULL convivem numa constraint UNIQUE, então não há como colidir com
  // a organização real nem com bancos de dev já semeados. Nenhuma tela exibe o
  // CNPJ da organização (não existe GET /organizations).
  const organization = await prisma.organization.upsert({
    where: { id: DEMO_ORGANIZATION_ID },
    update: { name: DEMO_ORGANIZATION_NAME, deletedAt: null },
    create: {
      id: DEMO_ORGANIZATION_ID,
      name: DEMO_ORGANIZATION_NAME,
      cnpj: null,
    },
  });

  const organizationId = organization.id;
  console.log(`Organização de demonstração: ${organization.name} (${organizationId})`);

  if (process.env.SEED_RESET === '1') {
    await resetDemoOrganization(organizationId);
  }

  // ---------- Users ----------
  const password = await bcrypt.hash(DEMO_PASSWORD, SALT_ROUNDS);

  const userSeeds = [
    {
      id: userId(1),
      name: 'Roberto Menezes',
      email: 'admin@demo.com',
      phone: '11987000001',
      cpf: '80000000101',
      role: Role.ADM,
    },
    {
      id: userId(2),
      name: 'Carlos Antunes',
      email: 'funcionario@demo.com',
      phone: '11987000002',
      cpf: '80000000202',
      role: Role.EMPLOYEE,
    },
    {
      id: userId(3),
      name: 'Juliana Prado',
      email: 'funcionario2@demo.com',
      phone: '11987000003',
      cpf: '80000000303',
      role: Role.EMPLOYEE,
    },
  ];

  const users = [];
  for (const user of userSeeds) {
    users.push(
      await prisma.user.upsert({
        where: { id: user.id },
        update: { ...user, organizationId, password, deletedAt: null },
        create: { ...user, organizationId, password },
      }),
    );
  }
  const [adm, carlos, juliana] = users;

  // ---------- Suppliers ----------
  const supplierSeeds = [
    {
      id: supplierId(1),
      name: 'Viação Serra Azul',
      cnpj: '11222333000144',
      address: 'Av. das Palmeiras, 1200 - São Paulo/SP',
      phone: '1133220001',
    },
    {
      id: supplierId(2),
      name: 'Turismo Vale Verde',
      cnpj: '22333444000155',
      address: 'Rua do Comércio, 45 - Campinas/SP',
      phone: '1933220002',
    },
    {
      id: supplierId(3),
      name: 'Fretamento Litoral Sul',
      cnpj: '33444555000166',
      address: 'Rod. dos Imigrantes, km 32 - Santos/SP',
      phone: '1333220003',
    },
  ];

  const suppliers = [];
  for (const supplier of supplierSeeds) {
    suppliers.push(
      await prisma.supplier.upsert({
        where: { id: supplier.id },
        update: { ...supplier, organizationId, deletedAt: null },
        create: { ...supplier, organizationId },
      }),
    );
  }
  const [serraAzul, valeVerde, litoralSul] = suppliers;

  // ---------- Customers ----------
  const customerSeeds = [
    { name: 'Ana Beatriz Ramos', email: 'ana.ramos@email.com', cpf: '90000000101' },
    { name: 'Bruno Carvalho', email: 'bruno.carvalho@email.com', cpf: '90000000202' },
    { name: 'Camila Nogueira', email: 'camila.nogueira@email.com', cpf: '90000000303' },
    { name: 'Diego Fontes', email: 'diego.fontes@email.com', cpf: '90000000404' },
    { name: 'Eduarda Lima', email: 'eduarda.lima@email.com', cpf: '90000000505' },
    { name: 'Felipe Andrade', email: 'felipe.andrade@email.com', cpf: '90000000606' },
    { name: 'Gabriela Souza', email: null, cpf: '90000000707' },
    { name: 'Henrique Barros', email: 'henrique.barros@email.com', cpf: '90000000808' },
    { name: 'Isabela Martins', email: 'isabela.martins@email.com', cpf: '90000000909' },
    { name: 'João Pedro Alves', email: 'joao.alves@email.com', cpf: '90000001010' },
    { name: 'Karina Duarte', email: 'karina.duarte@email.com', cpf: '90000001111' },
    { name: 'Lucas Ferreira', email: null, cpf: '90000001212' },
  ];

  const customers: { id: string }[] = [];
  for (const [index, customer] of customerSeeds.entries()) {
    const data = {
      ...customer,
      id: customerId(index + 1),
      organizationId,
      phone: `1198765${String(index + 1).padStart(4, '0')}`,
    };
    customers.push(
      await prisma.customer.upsert({
        where: { id: data.id },
        update: { ...data, deletedAt: null },
        create: data,
      }),
    );
  }
  const c = (n: number) => customers[n - 1];

  // ---------- Events ----------
  const eventSeeds = [
    {
      id: eventId(1),
      name: 'Festival Rio Live',
      address: 'Parque Olímpico - Av. Embaixador Abelardo Bueno, 3401',
      city: 'Rio de Janeiro',
      state: UF.RJ,
      startDate: NEAR_EVENT_START,
      endDate: addDays(NEAR_EVENT_START, 9),
      startTime: '14:00',
      endTime: '04:00',
    },
    {
      id: eventId(2),
      name: 'Festival Sertão Vivo',
      address: 'Pátio de Eventos Luiz Gonzaga',
      city: 'Caruaru',
      state: UF.PE,
      startDate: PAST_EVENT_START,
      endDate: addDays(PAST_EVENT_START, 4),
      startTime: '18:00',
      endTime: '05:00',
    },
    {
      id: eventId(3),
      name: 'Festival Praia de Copacabana',
      address: 'Praia de Copacabana - Posto 4',
      city: 'Rio de Janeiro',
      state: UF.RJ,
      startDate: FAR_EVENT_START,
      endDate: addDays(FAR_EVENT_START, 1),
      startTime: '20:00',
      endTime: '03:00',
    },
  ];

  // Um evento no passado e dois no futuro, sempre — é o que mantém o card de
  // Eventos do Dashboard com os dois grupos preenchidos.
  for (const event of eventSeeds) {
    assertRange(event.name, event.startDate, event.endDate);
    await prisma.event.upsert({
      where: { id: event.id },
      update: { ...event, organizationId, deletedAt: null },
      create: { ...event, organizationId },
    });
  }

  // ---------- Excursions ----------
  const excursionSeeds = [
    {
      id: excursionId(1),
      eventId: eventId(1),
      userId: adm.id,
      name: 'Excursão Rio Live — Fim de Semana 1',
      departureDate: NEAR_EVENT_START,
      returnDate: addDays(NEAR_EVENT_START, 1),
      // Vendas encerradas: é a excursão mais próxima do embarque. Cobre o
      // status CLOSED, que antes não aparecia em nenhuma das 5.
      status: ExcursionStatus.CLOSED,
      canceledAt: null,
      cancelReason: null,
    },
    {
      id: excursionId(2),
      eventId: eventId(1),
      userId: adm.id,
      name: 'Excursão Rio Live — Fim de Semana 2',
      departureDate: addDays(NEAR_EVENT_START, 7),
      returnDate: addDays(NEAR_EVENT_START, 8),
      status: ExcursionStatus.PLANNING,
      canceledAt: null,
      cancelReason: null,
    },
    {
      id: excursionId(3),
      eventId: eventId(2),
      userId: adm.id,
      name: 'Excursão Sertão Vivo',
      departureDate: PAST_EVENT_START,
      returnDate: addDays(PAST_EVENT_START, 4),
      status: ExcursionStatus.DONE,
      canceledAt: null,
      cancelReason: null,
    },
    {
      id: excursionId(4),
      eventId: eventId(3),
      userId: adm.id,
      name: 'Excursão Praia de Copacabana',
      departureDate: addDays(FAR_EVENT_START, -1),
      returnDate: addDays(FAR_EVENT_START, 1),
      status: ExcursionStatus.OPEN,
      canceledAt: null,
      cancelReason: null,
    },
    {
      id: excursionId(5),
      eventId: eventId(1),
      userId: adm.id,
      name: 'Excursão Rio Live — Camarote',
      departureDate: NEAR_EVENT_START,
      returnDate: addDays(NEAR_EVENT_START, 1),
      status: ExcursionStatus.CANCELED,
      // Cancelamento é fato consumado: ancora em `daysFromNow` negativo, nunca
      // na data de embarque (que agora é futura e produziria um cancelamento
      // com data no futuro).
      canceledAt: daysFromNow(-7),
      cancelReason: 'Fornecedor cancelou o veículo e não houve substituto.',
    },
  ];

  for (const excursion of excursionSeeds) {
    assertRange(excursion.name, excursion.departureDate, excursion.returnDate);
    await prisma.excursion.upsert({
      where: { id: excursion.id },
      update: { ...excursion, organizationId },
      create: { ...excursion, organizationId },
    });
  }

  // ---------- Vehicle bookings ----------
  // `price` é o valor do assento; `value` é o custo do veículo (ambos em centavos).
  const vehicleSeeds = [
    {
      id: vehicleId(1),
      excursionId: excursionId(1),
      supplierId: serraAzul.id,
      userId: carlos.id,
      vehicleType: 'Ônibus Executivo 46 lugares',
      plate: 'ABC1D23',
      capacity: 46,
      value: 850000,
      price: 32000,
      startTime: '06:00',
      returnTime: '23:00',
    },
    {
      id: vehicleId(2),
      excursionId: excursionId(1),
      supplierId: valeVerde.id,
      userId: juliana.id,
      vehicleType: 'Micro-ônibus 26 lugares',
      plate: 'EFG4H56',
      capacity: 26,
      value: 520000,
      price: 35000,
      startTime: '06:30',
      returnTime: '23:30',
    },
    {
      id: vehicleId(3),
      excursionId: excursionId(2),
      supplierId: serraAzul.id,
      userId: carlos.id,
      vehicleType: 'Ônibus Leito 42 lugares',
      plate: 'IJK7L89',
      capacity: 42,
      value: 910000,
      price: 38000,
      startTime: '06:00',
      returnTime: '23:00',
    },
    {
      id: vehicleId(4),
      excursionId: excursionId(3),
      supplierId: litoralSul.id,
      userId: juliana.id,
      vehicleType: 'Ônibus Convencional 48 lugares',
      plate: 'MNO1P23',
      capacity: 48,
      value: 780000,
      price: 29000,
      startTime: '19:00',
      returnTime: '08:00',
    },
    {
      id: vehicleId(5),
      excursionId: excursionId(4),
      supplierId: valeVerde.id,
      userId: adm.id,
      vehicleType: 'Ônibus Executivo 46 lugares',
      plate: 'QRS4T56',
      capacity: 46,
      value: 1200000,
      price: 45000,
      startTime: '07:00',
      returnTime: '10:00',
    },
    {
      id: vehicleId(6),
      excursionId: excursionId(4),
      supplierId: litoralSul.id,
      userId: carlos.id,
      vehicleType: 'Van Executiva 15 lugares',
      plate: 'UVW7X89',
      capacity: 15,
      value: 350000,
      price: 52000,
      startTime: '07:30',
      returnTime: '10:30',
    },
  ];

  for (const vehicle of vehicleSeeds) {
    await prisma.vehicleBooking.upsert({
      where: { id: vehicle.id },
      update: { ...vehicle, organizationId, deletedAt: null },
      create: { ...vehicle, organizationId },
    });
  }

  // ---------- Boarding points ----------
  const boardingSeeds = [
    { id: boardingId(1), vehicleBookingId: vehicleId(1), address: 'Terminal Rodoviário do Tietê — Portão 5, São Paulo/SP', time: '05:30' },
    { id: boardingId(2), vehicleBookingId: vehicleId(1), address: 'Metrô Tatuapé — Praça de táxis, São Paulo/SP', time: '06:00' },
    { id: boardingId(3), vehicleBookingId: vehicleId(2), address: 'Praça da Sé — em frente à Catedral, São Paulo/SP', time: '05:45' },
    { id: boardingId(4), vehicleBookingId: vehicleId(2), address: 'Shopping Aricanduva — Portão A, São Paulo/SP', time: '06:15' },
    { id: boardingId(5), vehicleBookingId: vehicleId(3), address: 'Terminal Rodoviário do Tietê — Portão 5, São Paulo/SP', time: '06:00' },
    { id: boardingId(6), vehicleBookingId: vehicleId(3), address: 'Estação Barra Funda — Desembarque, São Paulo/SP', time: '06:30' },
    { id: boardingId(7), vehicleBookingId: vehicleId(4), address: 'Terminal Rodoviário de Campinas — Plataforma 3, Campinas/SP', time: '19:00' },
    { id: boardingId(8), vehicleBookingId: vehicleId(4), address: 'Posto Graal — Rod. Anhanguera, km 92', time: '20:00' },
    { id: boardingId(9), vehicleBookingId: vehicleId(5), address: 'Terminal Rodoviário do Tietê — Portão 2, São Paulo/SP', time: '07:00' },
    { id: boardingId(10), vehicleBookingId: vehicleId(6), address: 'Aeroporto de Congonhas — Desembarque, São Paulo/SP', time: '07:30' },
    { id: boardingId(11), vehicleBookingId: vehicleId(5), address: 'Metrô Santana — Saída Norte, São Paulo/SP', time: '06:40' },
  ];

  for (const boardingPoint of boardingSeeds) {
    await prisma.boardingPoint.upsert({
      where: { id: boardingPoint.id },
      update: { ...boardingPoint, organizationId, deletedAt: null },
      create: { ...boardingPoint, organizationId },
    });
  }

  // ---------- Reservations + Payments ----------
  // Status coerente com o histórico de pagamentos, mesma regra dos Services:
  // 100% pago = CONFIRMED, >=50% = PENDING, sem pagamento = WAITLIST.
  // Nenhum cliente tem duas reservas ativas no mesmo Evento, e a soma de
  // PENDING/CONFIRMED por veículo nunca passa da `capacity`.
  type PaymentSeed = { value: number; type: PaymentType; method: PaymentMethod };
  type ReservationSeed = {
    n: number;
    vehicleBookingId: string;
    boardingPointId: string | null;
    customerId: string;
    userId: string;
    status: ReservationStatus;
    agreedValue: number;
    canceledAt?: Date;
    cancelReason?: string;
    payments: PaymentSeed[];
  };

  const pix = (value: number): PaymentSeed => ({ value, type: PaymentType.PAYMENT, method: PaymentMethod.PIX });
  const card = (value: number): PaymentSeed => ({ value, type: PaymentType.PAYMENT, method: PaymentMethod.CARD });
  const cash = (value: number): PaymentSeed => ({ value, type: PaymentType.PAYMENT, method: PaymentMethod.CASH });
  const reversal = (value: number): PaymentSeed => ({ value, type: PaymentType.REVERSAL, method: PaymentMethod.PIX });

  const reservationSeeds: ReservationSeed[] = [
    // Veículo 1 — Rock in Rio FDS 1 (capacidade 46)
    { n: 1, vehicleBookingId: vehicleId(1), boardingPointId: boardingId(1), customerId: c(1).id, userId: carlos.id, status: ReservationStatus.CONFIRMED, agreedValue: 32000, payments: [pix(16000), pix(16000)] },
    { n: 2, vehicleBookingId: vehicleId(1), boardingPointId: boardingId(1), customerId: c(2).id, userId: carlos.id, status: ReservationStatus.CONFIRMED, agreedValue: 32000, payments: [card(32000)] },
    { n: 3, vehicleBookingId: vehicleId(1), boardingPointId: boardingId(2), customerId: c(3).id, userId: adm.id, status: ReservationStatus.PENDING, agreedValue: 32000, payments: [pix(16000)] },
    { n: 4, vehicleBookingId: vehicleId(1), boardingPointId: null, customerId: c(4).id, userId: juliana.id, status: ReservationStatus.WAITLIST, agreedValue: 32000, payments: [] },
    { n: 5, vehicleBookingId: vehicleId(1), boardingPointId: boardingId(2), customerId: c(5).id, userId: carlos.id, status: ReservationStatus.CANCELED, agreedValue: 32000, canceledAt: daysFromNow(-12), cancelReason: 'Cliente desistiu da viagem.', payments: [pix(16000), reversal(16000)] },

    // Veículo 2 — Rock in Rio FDS 1 (capacidade 26)
    { n: 6, vehicleBookingId: vehicleId(2), boardingPointId: boardingId(3), customerId: c(6).id, userId: juliana.id, status: ReservationStatus.CONFIRMED, agreedValue: 35000, payments: [cash(35000)] },
    { n: 7, vehicleBookingId: vehicleId(2), boardingPointId: boardingId(4), customerId: c(7).id, userId: juliana.id, status: ReservationStatus.PENDING, agreedValue: 35000, payments: [pix(20000)] },
    { n: 8, vehicleBookingId: vehicleId(2), boardingPointId: null, customerId: c(8).id, userId: adm.id, status: ReservationStatus.WAITLIST, agreedValue: 35000, payments: [] },

    // Veículo 3 — Rock in Rio FDS 2 (capacidade 42)
    { n: 9, vehicleBookingId: vehicleId(3), boardingPointId: boardingId(5), customerId: c(9).id, userId: carlos.id, status: ReservationStatus.CONFIRMED, agreedValue: 38000, payments: [pix(19000), pix(19000)] },
    { n: 10, vehicleBookingId: vehicleId(3), boardingPointId: boardingId(6), customerId: c(10).id, userId: carlos.id, status: ReservationStatus.PENDING, agreedValue: 38000, payments: [card(25000)] },
    // C5 cancelou no veículo 1 (mesmo evento), então pode reservar de novo.
    { n: 11, vehicleBookingId: vehicleId(3), boardingPointId: null, customerId: c(5).id, userId: adm.id, status: ReservationStatus.WAITLIST, agreedValue: 38000, payments: [] },

    // Veículo 4 — São João de Caruaru (excursão DONE, capacidade 48)
    { n: 12, vehicleBookingId: vehicleId(4), boardingPointId: boardingId(7), customerId: c(1).id, userId: juliana.id, status: ReservationStatus.CONFIRMED, agreedValue: 29000, payments: [pix(29000)] },
    { n: 13, vehicleBookingId: vehicleId(4), boardingPointId: boardingId(7), customerId: c(2).id, userId: juliana.id, status: ReservationStatus.CONFIRMED, agreedValue: 29000, payments: [cash(29000)] },
    { n: 14, vehicleBookingId: vehicleId(4), boardingPointId: boardingId(8), customerId: c(3).id, userId: adm.id, status: ReservationStatus.CONFIRMED, agreedValue: 29000, payments: [pix(14500), pix(14500)] },
    { n: 15, vehicleBookingId: vehicleId(4), boardingPointId: boardingId(8), customerId: c(11).id, userId: juliana.id, status: ReservationStatus.CONFIRMED, agreedValue: 29000, payments: [card(29000)] },

    // Veículo 5 — Réveillon (capacidade 46)
    { n: 16, vehicleBookingId: vehicleId(5), boardingPointId: boardingId(9), customerId: c(1).id, userId: adm.id, status: ReservationStatus.PENDING, agreedValue: 45000, payments: [pix(25000)] },
    { n: 17, vehicleBookingId: vehicleId(5), boardingPointId: boardingId(9), customerId: c(4).id, userId: adm.id, status: ReservationStatus.CONFIRMED, agreedValue: 45000, payments: [pix(45000)] },
    { n: 18, vehicleBookingId: vehicleId(5), boardingPointId: null, customerId: c(6).id, userId: carlos.id, status: ReservationStatus.WAITLIST, agreedValue: 45000, payments: [] },
    { n: 19, vehicleBookingId: vehicleId(5), boardingPointId: boardingId(9), customerId: c(12).id, userId: adm.id, status: ReservationStatus.CONFIRMED, agreedValue: 45000, payments: [pix(20000), card(25000)] },

    // Veículo 6 — Réveillon, van (capacidade 15)
    { n: 20, vehicleBookingId: vehicleId(6), boardingPointId: boardingId(10), customerId: c(2).id, userId: carlos.id, status: ReservationStatus.CONFIRMED, agreedValue: 52000, payments: [pix(52000)] },
    { n: 21, vehicleBookingId: vehicleId(6), boardingPointId: boardingId(10), customerId: c(7).id, userId: carlos.id, status: ReservationStatus.PENDING, agreedValue: 52000, payments: [card(30000)] },
    { n: 22, vehicleBookingId: vehicleId(6), boardingPointId: null, customerId: c(9).id, userId: juliana.id, status: ReservationStatus.WAITLIST, agreedValue: 52000, payments: [] },
  ];

  // `Payment.createdAt` é exibido na listagem e no detalhe. Sem gravá-lo, todos
  // os pagamentos ficariam com a data de hoje — inclusive os da excursão que
  // aconteceu há meses. Deriva-se do embarque do veículo da reserva.
  const departureByExcursionId = new Map(
    excursionSeeds.map((excursion) => [excursion.id, excursion.departureDate]),
  );
  const departureByVehicleId = new Map(
    vehicleSeeds.map((vehicle) => [
      vehicle.id,
      departureByExcursionId.get(vehicle.excursionId) as Date,
    ]),
  );

  const PAYMENT_DAYS_BEFORE_DEPARTURE = [-60, -30, -15];

  // O clamp em `latest` garante que nenhuma parcela caia no futuro (as
  // excursões futuras embarcam daqui a 1 e 4 meses) preservando a ordem entre
  // elas: `total - index` é sempre >= 1.
  const paymentCreatedAt = (departure: Date, index: number, total: number) => {
    const wanted = addDays(
      departure,
      PAYMENT_DAYS_BEFORE_DEPARTURE[index] ?? -7,
    );
    const latest = daysFromNow(-(total - index));
    return wanted < latest ? wanted : latest;
  };

  let paymentCounter = 0;
  for (const { n, payments, canceledAt, cancelReason, ...reservation } of reservationSeeds) {
    const data = {
      ...reservation,
      id: reservationId(n),
      organizationId,
      canceledAt: canceledAt ?? null,
      cancelReason: cancelReason ?? null,
    };

    await prisma.reservation.upsert({
      where: { id: data.id },
      update: { ...data, deletedAt: null },
      create: data,
    });

    const departure = departureByVehicleId.get(data.vehicleBookingId) as Date;

    for (const [index, payment] of payments.entries()) {
      paymentCounter += 1;
      const paymentData = {
        ...payment,
        id: paymentId(paymentCounter),
        organizationId,
        reservationId: data.id,
        userId: data.userId,
        createdAt: paymentCreatedAt(departure, index, payments.length),
      };

      await prisma.payment.upsert({
        where: { id: paymentData.id },
        update: paymentData,
        create: paymentData,
      });
    }
  }

  // ---------- Expenses ----------
  const expenseSeeds = [
    { id: expenseId(1), excursionId: excursionId(1), vehicleBookingId: vehicleId(1), userId: carlos.id, category: ExpensesCategory.FUEL, value: 120000, description: 'Abastecimento de ida e volta — ônibus executivo' },
    { id: expenseId(2), excursionId: excursionId(1), vehicleBookingId: vehicleId(1), userId: carlos.id, category: ExpensesCategory.TOLL, value: 18500, description: 'Pedágios da rota SP–RJ' },
    { id: expenseId(3), excursionId: excursionId(1), vehicleBookingId: null, userId: adm.id, category: ExpensesCategory.FOOD, value: 45000, description: 'Lanche da equipe de apoio' },
    { id: expenseId(4), excursionId: excursionId(2), vehicleBookingId: vehicleId(3), userId: carlos.id, category: ExpensesCategory.SUPPLIES, value: 22000, description: 'Água e kit lanche para os passageiros' },
    { id: expenseId(5), excursionId: excursionId(3), vehicleBookingId: vehicleId(4), userId: juliana.id, category: ExpensesCategory.FUEL, value: 98000, description: 'Abastecimento São Paulo — Caruaru' },
    { id: expenseId(6), excursionId: excursionId(3), vehicleBookingId: vehicleId(4), userId: juliana.id, category: ExpensesCategory.TOLL, value: 24000, description: 'Pedágios da rota SP–PE' },
    { id: expenseId(7), excursionId: excursionId(3), vehicleBookingId: null, userId: adm.id, category: ExpensesCategory.OTHER, value: 30000, description: 'Estacionamento do ônibus no evento' },
    { id: expenseId(8), excursionId: excursionId(4), vehicleBookingId: vehicleId(5), userId: adm.id, category: ExpensesCategory.SUPPLIES, value: 35000, description: 'Decoração e brindes de Réveillon' },
    { id: expenseId(9), excursionId: excursionId(4), vehicleBookingId: vehicleId(6), userId: carlos.id, category: ExpensesCategory.FUEL, value: 60000, description: 'Abastecimento da van executiva' },
  ];

  for (const expense of expenseSeeds) {
    await prisma.expense.upsert({
      where: { id: expense.id },
      update: { ...expense, organizationId, deletedAt: null },
      create: { ...expense, organizationId },
    });
  }

  console.log('Seed concluído:');
  console.log(`  ${userSeeds.length} usuários`);
  console.log(`  ${supplierSeeds.length} fornecedores`);
  console.log(`  ${customerSeeds.length} clientes`);
  console.log(`  ${eventSeeds.length} eventos`);
  console.log(`  ${excursionSeeds.length} excursões`);
  console.log(`  ${vehicleSeeds.length} veículos`);
  console.log(`  ${boardingSeeds.length} pontos de embarque`);
  console.log(`  ${reservationSeeds.length} reservas`);
  console.log(`  ${paymentCounter} pagamentos`);
  console.log(`  ${expenseSeeds.length} despesas`);
  console.log('');
  console.log('Credenciais de demonstração:');
  console.log(`  ADM       ${userSeeds[0].email} / ${DEMO_PASSWORD}`);
  console.log(`  EMPLOYEE  ${userSeeds[1].email} / ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
