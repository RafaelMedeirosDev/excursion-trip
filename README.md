# Excursion Trip

![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-relacional-4169E1?logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10-F69220?logo=pnpm&logoColor=white)

Sistema multi-tenant de gestão de excursões para eventos — do cadastro do evento à conciliação dos pagamentos das reservas.

---

## Sobre o projeto

**Excursion Trip** é uma aplicação **full stack** organizada como **monorepo**, composta por uma API REST em NestJS e uma SPA em React. O projeto resolve a operação de empresas e organizadores que fretam veículos para levar passageiros a eventos: é preciso controlar quais veículos foram contratados de quais fornecedores, quantas vagas ainda existem em cada um, quem reservou, quanto cada passageiro combinou pagar, quanto já pagou e quais despesas a excursão gerou.

O sistema é **multi-tenant por organização**: toda entidade do domínio carrega um `organizationId`, e esse identificador é sempre derivado do token JWT do usuário autenticado — **nunca do corpo da requisição**. Na prática, um usuário só enxerga e só escreve dados da própria organização, sem que isso dependa de disciplina do cliente.

O domínio está confirmado pela modelagem e pelos módulos implementados, que seguem a cadeia operacional real:

```
Event → Excursion → VehicleBooking → Reservation → Payment
                          ↓              ↑
                    BoardingPoint    Customer
                          
Supplier → VehicleBooking        Expense → Excursion / VehicleBooking
```

O backend cobre o domínio completo (11 entidades de negócio) e o frontend entrega telas para 10 delas.

---

## Destaques técnicos

- **API REST com NestJS + TypeScript**, em arquitetura de camadas própria (`Controller → Service → Domain → External`), com inversão de dependência entre caso de uso e persistência.
- **Prisma ORM + PostgreSQL** com **15 migrations versionadas**, modelagem relacional de 12 entidades, 7 enums e índices em todas as chaves estrangeiras.
- **Autenticação JWT com refresh token opaco e rotativo** — armazenado no banco apenas como hash SHA-256, revogado e reemitido a cada uso.
- **Autorização em dois níveis**: RBAC por papel (`ADM` / `EMPLOYEE`) via guard + decorator, e **escopo por linha** em reservas, pagamentos e veículos.
- **Regras de negócio não triviais**: máquinas de estado para excursão e reserva, validação de capacidade de veículo em três pontos do fluxo e sincronização automática do status da reserva a partir do histórico de pagamentos.
- **Valores monetários sempre em `Int` (centavos)** — nunca `Float`, nunca `Decimal` — eliminando erro de arredondamento em toda a stack.
- **Monorepo pnpm workspaces + Turborepo**, com tsconfig e ESLint compartilhados e um pacote interno de tipos consumido pelo frontend.
- **155 testes unitários** distribuídos em 38 arquivos, cobrindo caminho feliz e cada erro de negócio da camada de service.
- **CI no GitHub Actions** executando build, lint e testes em todo pull request para `main`.
- **SPA em React 19 + Vite + Tailwind + shadcn/ui**, com TanStack Query, React Hook Form + Zod e layout responsivo (tabela no desktop, cards no mobile).

---

## Principais funcionalidades

> As operações de escrita implementadas são **criação** e **transições de status**. Não há, até o momento, endpoint de atualização genérica nem de exclusão em nenhuma entidade — ver [Status do projeto](#status-do-projeto).

### Autenticação

- `POST /auth/login` — autenticação por e-mail e senha (bcrypt), devolvendo `accessToken` (JWT) e `refreshToken`.
- `POST /auth/refresh` — troca o refresh token por um novo par, **revogando o token usado** (rotação).
- `POST /auth/logout` — revoga o refresh token; idempotente, nunca falha.
- **Rate limit de 5 requisições por minuto** em `login` e `refresh`.
- A aplicação **se recusa a subir** se `JWT_SECRET` estiver ausente ou com o valor placeholder do `.env.example`.

### Cadastros e consultas

Todas as entidades abaixo expõem **criação**, **listagem** e **consulta por ID**:

| Domínio | Rotas | Papel exigido |
| --- | --- | --- |
| Usuários | `POST /users`, `GET /users`, `GET /users/:id` | `ADM` para criar e listar |
| Clientes (passageiros) | `POST /customers`, `GET /customers`, `GET /customers/:id` | qualquer autenticado |
| Fornecedores | `POST /suppliers`, `GET /suppliers`, `GET /suppliers/:id` | `ADM` para criar e listar |
| Eventos | `POST /events`, `GET /events`, `GET /events/:id` | `ADM` para criar |
| Excursões | `POST /excursions`, `GET /excursions`, `GET /excursions/:id` | `ADM` para criar e listar |
| Veículos fretados | `POST /vehicle-bookings`, `GET /vehicle-bookings`, `GET /vehicle-bookings/:id` | `ADM` para criar |
| Pontos de embarque | `POST /boarding-points`, `GET /boarding-points`, `GET /boarding-points/:id` | `ADM` para criar |
| Reservas | `POST /reservations`, `GET /reservations`, `GET /reservations/:id` | qualquer autenticado |
| Pagamentos | `POST /payments`, `GET /payments`, `GET /payments/:id` | qualquer autenticado |
| Despesas | `POST /expenses`, `GET /expenses`, `GET /expenses/:id` | qualquer autenticado |
| Organizações | `POST /organizations` | `ADM` |

`Organization` é a única entidade sem rotas de leitura — o vínculo do usuário com a organização vem do próprio JWT.

### Ciclo de vida da excursão

`PATCH /excursions/:id/status` (`ADM`) aplica uma máquina de estados fechada:

```
PLANNING ──▶ OPEN ──▶ CLOSED ──▶ DONE
    │         │          │
    └─────────┴──────────┴──▶ CANCELED   (exige motivo)
```

Transições fora dessa tabela são rejeitadas com erro de negócio. `DONE` e `CANCELED` são estados terminais.

### Ciclo de vida da reserva

Toda reserva nasce em `WAITLIST`. As transições são rotas dedicadas, cada uma validada contra o histórico de pagamentos:

- `POST /reservations/:id/pending` — exige **pelo menos 50%** do valor acordado já pago.
- `POST /reservations/:id/confirm` — exige **100%** do valor acordado.
- `POST /reservations/:id/cancel` — exige motivo de cancelamento.

### Pagamentos

- Registro de lançamentos do tipo `PAYMENT` ou `REVERSAL`, com método `PIX`, `CASH` ou `CARD`.
- Ao registrar um pagamento, o status da reserva é **recalculado automaticamente** sobre o histórico completo, de forma **bidirecional**: um estorno pode rebaixar uma reserva de `CONFIRMED` para `PENDING` ou `WAITLIST`.

### Validações e regras aplicadas

- Capacidade do veículo verificada na criação da reserva e nas transições que passam a ocupar vaga.
- Intervalo de datas validado em eventos (`endDate` ≥ `startDate`) e excursões (`returnDate` ≥ `departureDate`).
- Veículos e reservas só podem ser criados com a excursão em `PLANNING` ou `OPEN`.
- CPF único por organização (usuários e clientes), CNPJ único por organização (fornecedores), placa única por excursão.
- E-mail globalmente único entre usuários.
- Um mesmo cliente não pode ter duas reservas ativas **para o mesmo evento**, ainda que em veículos diferentes.
- Corpo de requisição validado por DTOs com `class-validator`; campos não declarados fazem a requisição falhar com `400`.

### Filtros

- `GET /excursions?status=` — filtra por status da excursão.
- `GET /reservations?status=&vehicleBookingId=` — filtra por status e/ou por veículo.

---

## Tecnologias utilizadas

### Backend

| Tecnologia | Uso |
| --- | --- |
| **NestJS 10** | framework HTTP, injeção de dependência, guards e pipes |
| **TypeScript 5** | linguagem, com `strict` habilitado |
| **Prisma 5.22** | ORM, client tipado e migrations |
| **@nestjs/jwt + passport-jwt** | emissão e validação do access token |
| **bcrypt** | hash de senha (10 salt rounds) |
| **class-validator / class-transformer** | validação e transformação dos DTOs |
| **@nestjs/throttler** | rate limit nas rotas de autenticação |
| **@nestjs/config** | carregamento das variáveis de ambiente |
| **@nestjs/swagger** | apenas `@ApiProperty` nas classes de erro — ver observação abaixo |

> **Observação honesta sobre Swagger:** o pacote `@nestjs/swagger` é dependência do projeto e é usado para decorar as classes base de erro, mas **não existe `SwaggerModule.setup` na aplicação**. Portanto **não há documentação OpenAPI servida** em nenhuma rota. Expor a documentação é um passo previsto, não um recurso entregue.

### Frontend

SPA completa, com telas funcionais para 10 dos 11 domínios do backend — não é um esqueleto.

| Tecnologia | Uso |
| --- | --- |
| **React 19 + Vite 8** | biblioteca de UI e bundler/dev server |
| **TypeScript 5** | tipagem de ponta a ponta |
| **Tailwind CSS 3 + shadcn/ui** | design system baseado em Radix UI e CSS variables |
| **TanStack Query 5** | cache de servidor, invalidação e estados de loading/erro |
| **React Hook Form + Zod** | formulários e validação de schema no cliente |
| **Zustand** | store de autenticação |
| **Axios** | cliente HTTP com interceptors de token e refresh |
| **React Router 7** | roteamento e rotas protegidas |
| **lucide-react** | ícones |

Cada domínio possui página de listagem (com busca), página de detalhe e página de criação. **Não existem telas de edição ou exclusão**, em coerência com a API — o backend ainda não oferece essas operações.

### Banco de dados

- **PostgreSQL** como banco relacional.
- **Prisma ORM** com client gerado e tipado, e **Prisma Migrate** com 15 migrations versionadas no repositório.
- Modelagem relacional normalizada, chaves primárias `uuid()`, timestamps automáticos e índices em todas as chaves estrangeiras.

### Monorepo e ferramentas

- **pnpm workspaces** (`apps/*`, `packages/*`) com `packageManager` fixado.
- **Turborepo** orquestrando `build`, `dev`, `lint` e `test` com grafo de dependências entre pacotes.
- **`packages/config`** — `tsconfig.base.json` e `eslint.base.js` compartilhados pelos dois apps.
- **`packages/shared`** — enums e labels de exibição consumidos pelo frontend, evitando redeclaração em cada módulo.
- **ESLint 9** em flat config, com `typescript-eslint` e, no frontend, `eslint-plugin-react-hooks`.
- **GitHub Actions** — workflow único que roda `prisma generate`, `build`, `lint` e `test` em todo pull request para `main`.

> Não há Prettier configurado no repositório.

### Testes

- **Jest + ts-jest** no backend: **38 arquivos `.spec.ts`, 155 casos de teste**, cobrindo a camada de service com mocks manuais dos contratos de `Repository` — não tocam o banco, o que permite rodar a suíte no CI sem PostgreSQL.
- Cada service testa o caminho feliz e **cada erro de negócio que ele é capaz de lançar**.
- Não existem testes de controller, de repositório, end-to-end, nem testes no frontend.

---

## Arquitetura do projeto

### Monorepo

| Pacote | Responsabilidade |
| --- | --- |
| `apps/backend` | API REST NestJS + Prisma, schema e migrations |
| `apps/frontend` | SPA React + Vite que consome a API |
| `packages/config` | `tsconfig` e ESLint base compartilhados |
| `packages/shared` | enums e labels de exibição, consumidos apenas pelo frontend |

O backend **não depende de `packages/shared`**: ele usa os enums gerados pelo `@prisma/client`, que são a fonte de verdade derivada do `schema.prisma`.

### Backend — camadas

```
Controller  →  Service  →  Domain (contrato abstrato)
                              ⇅
                          External (implementação Prisma)
```

- **`controller/`** — apenas HTTP: rotas, guards, códigos de status e delegação ao service. Não contém regra de negócio.
- **`service/`** — casos de uso, um arquivo por operação (`CreateReservationService`, `ConfirmReservationService`, …), organizados por domínio. Concentram toda a regra de negócio e dependem apenas de classes abstratas.
- **`domain/`** — contratos de repositório como classes abstratas (`ReservationRepository`, `PaymentRepository`, …) e os tipos de entidade.
- **`external/repositories/remote/`** — implementações concretas com Prisma. O Prisma não vaza para fora dessa pasta.
- **`shared/dtos/`** — 18 DTOs com validação declarativa.
- **`shared/erros/`** — hierarquia de erros de domínio.
- **`guards/`, `strategies/`, `decorators/`** — `JwtAuthGuard`, `RolesGuard`, `JwtStrategy`, `@Roles`, `@CurrentUser`.

A inversão de dependência é feita no container do Nest, ligando cada contrato à sua implementação (`{ provide: ReservationRepository, useClass: PrismaReservationRepository }`). Trocar a persistência não exige tocar em nenhum service.

**Não há um módulo Nest por entidade**: controllers, services e bindings são registrados em um único `app.module.ts`, decisão consciente para manter a árvore de arquivos plana enquanto o projeto tem um único contexto delimitado.

**Hierarquia de erros** — cada erro de negócio herda de uma base que já carrega o status HTTP correto e expõe um código legível por máquina:

| Classe base | HTTP | Exemplos concretos |
| --- | --- | --- |
| `AlreadyExistsError` | `409` | `CustomerAlreadyExists`, `ReservationAlreadyExists` |
| `NotFoundError` | `404` | `ExcursionNotFound`, `VehicleBookingNotFound` |
| `UnauthorizedError` | `401` | `InvalidCredentials`, `InvalidRefreshToken` |
| `InvalidStateError` | `400` | `VehicleBookingCapacityExceeded`, `InvalidExcursionStatusTransition` |

São 29 erros concretos, cada um com mensagem em português e código `snake_case` — o cliente pode reagir ao código sem depender do texto.

### Frontend — organização por domínio

A estrutura é **por domínio, não por tipo de arquivo**. Cada feature concentra sua própria camada de API, hooks, páginas, tipos e schemas de validação:

```
features/reservations/
├── api/            chamadas HTTP do domínio
├── components/     componentes específicos (badges, dialogs de ação)
├── hooks/          hooks TanStack Query (queries e mutations)
├── pages/          listagem, detalhe e criação
├── types/          tipos do domínio
└── validations/    schemas Zod dos formulários
```

A camada compartilhada é deliberadamente enxuta: `components/ui` (shadcn), `components/layout`, `services/http` (cliente Axios e interceptors), `store` (autenticação) e `routes` (guards de rota).

---

## Estrutura de pastas

```
excursion-trip/
├── apps/
│   ├── backend/
│   │   ├── prisma/
│   │   │   ├── migrations/          # 15 migrations versionadas
│   │   │   └── schema.prisma
│   │   └── src/
│   │       ├── controller/          # 12 controllers REST
│   │       ├── service/             # casos de uso por domínio (+ .spec.ts)
│   │       ├── domain/              # contratos de Repository (abstratos)
│   │       ├── external/
│   │       │   └── repositories/    # implementações Prisma
│   │       ├── shared/
│   │       │   ├── dtos/            # 18 DTOs com class-validator
│   │       │   └── erros/           # base/ + cases/
│   │       ├── guards/              # JwtAuthGuard, RolesGuard
│   │       ├── strategies/          # JwtStrategy
│   │       ├── decorators/          # @Roles, @CurrentUser
│   │       ├── app.module.ts
│   │       └── main.ts
│   └── frontend/
│       └── src/
│           ├── app/                 # App, providers, router
│           ├── components/          # ui (shadcn), layout, feedback
│           ├── features/            # auth, dashboard, events, excursions,
│           │                        # customers, suppliers, users,
│           │                        # vehicleBookings, boardingPoints,
│           │                        # reservations, payments
│           ├── routes/              # PrivateRoute, PublicRoute, AdminRoute
│           ├── services/http/       # cliente Axios + interceptors
│           ├── store/               # authStore (Zustand)
│           └── lib/                 # utilitários, queryClient, jwt
├── packages/
│   ├── config/                      # tsconfig.base.json, eslint.base.js
│   └── shared/                      # enums e labels compartilhados
├── .github/workflows/ci.yml
├── pnpm-workspace.yaml
└── turbo.json
```

---

## Modelagem de dados

O `schema.prisma` define **12 models** e **7 enums**.

### Entidades

| Entidade | Responsabilidade | Relacionamentos principais |
| --- | --- | --- |
| `Organization` | tenant raiz do sistema | 1-N com todas as demais entidades de negócio |
| `User` | usuário operador da organização | pertence a `Organization`; registra excursões, veículos, reservas, pagamentos e despesas |
| `RefreshToken` | sessão persistida (hash, expiração, revogação) | pertence a `User` |
| `Customer` | passageiro | pertence a `Organization`; 1-N com `Reservation` |
| `Supplier` | fornecedor de veículos | pertence a `Organization`; 1-N com `VehicleBooking` |
| `Event` | evento de destino (com data, horário, cidade e UF) | 1-N com `Excursion` |
| `Excursion` | viagem organizada para um evento | pertence a `Event`; 1-N com `VehicleBooking` e `Expense` |
| `VehicleBooking` | veículo fretado, com capacidade, custo e preço | pertence a `Excursion` e `Supplier`; 1-N com `Reservation` e `BoardingPoint` |
| `BoardingPoint` | ponto de embarque de um veículo | pertence a `VehicleBooking` |
| `Reservation` | vaga de um cliente em um veículo | pertence a `Customer` e `VehicleBooking`; 1-N com `Payment` |
| `Payment` | lançamento financeiro da reserva | pertence a `Reservation` |
| `Expense` | despesa da excursão | pertence a `Excursion`; opcionalmente a `VehicleBooking` |

### Enums

| Enum | Valores |
| --- | --- |
| `Role` | `ADM`, `EMPLOYEE` |
| `ExcursionStatus` | `PLANNING`, `OPEN`, `CLOSED`, `DONE`, `CANCELED` |
| `ReservationStatus` | `WAITLIST`, `PENDING`, `CONFIRMED`, `CANCELED` |
| `PaymentType` | `PAYMENT`, `REVERSAL` |
| `PaymentMethod` | `PIX`, `CASH`, `CARD` |
| `ExpensesCategory` | `FUEL`, `TOLL`, `FOOD`, `SUPPLIES`, `OTHER` |
| `UF` | as 27 unidades federativas |

### Convenções do schema

- **Chaves primárias `String @id @default(uuid())`** em todos os models.
- **Timestamps**: `createdAt` e `updatedAt` na maioria dos models (`Payment` e `RefreshToken`, imutáveis por natureza, têm apenas `createdAt`).
- **Constraints compostas por organização**: `@@unique([organizationId, cpf])` em `User` e `Customer`, `@@unique([organizationId, cnpj])` em `Supplier`, `@@unique([excursionId, plate])` em `VehicleBooking`. O CPF de um passageiro é único dentro do tenant, não globalmente.
- **Índices** em todas as chaves estrangeiras, além de `userId` e `tokenHash` em `RefreshToken`.
- **Valores monetários como `Int`, em centavos** — `VehicleBooking.value` e `.price`, `Reservation.agreedValue`, `Payment.value`, `Expense.value`. R$ 50,50 é persistido como `5050`. A conversão para reais acontece apenas na borda de apresentação.
- **Campos de auditoria de cancelamento**: `canceledAt` e `cancelReason` em `Excursion` e `Reservation`.
- **Soft delete preparado, ainda não ativo**: a coluna `deletedAt DateTime?` existe em 9 models e as listagens já filtram por `deletedAt: null`, mas como ainda não há rota de exclusão, nenhum registro é marcado. A infraestrutura está pronta para quando a operação existir.

---

## Autenticação e autorização

### Login e sessão

1. `POST /auth/login` recebe e-mail e senha; a senha é comparada com o hash bcrypt armazenado.
2. Em caso de sucesso, é emitido um **access token JWT** com o payload `{ sub, organizationId, organizationName, name, role }` — o `organizationId` viaja no token, e é ele que escopa toda consulta subsequente.
3. Junto vem um **refresh token opaco** (32 bytes aleatórios em hexadecimal, **não é um JWT**). No banco fica gravado apenas o seu **hash SHA-256** — o valor original nunca é persistido.
4. `POST /auth/refresh` valida o hash, rejeita tokens revogados ou expirados, **revoga o token apresentado** e emite um par novo (rotação). Cada login cria uma linha independente, então múltiplas sessões coexistem e podem ser revogadas isoladamente.
5. `POST /auth/logout` revoga o refresh token e é idempotente — chamar duas vezes não produz erro.

Os tempos de vida são configuráveis por ambiente (`JWT_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN_HOURS`).

### Proteção de rotas

- `/auth/login`, `/auth/refresh`, `/auth/logout` e `/health` são as **únicas rotas públicas**. Todo o restante exige `Authorization: Bearer <accessToken>`.
- Todos os controllers de domínio aplicam `@UseGuards(JwtAuthGuard, RolesGuard)` **no nível da classe**.
- `@Roles(Role.ADM)` restringe operações administrativas (criação de usuários, fornecedores, eventos, excursões, veículos e pontos de embarque).
- **Escopo por linha** complementa o RBAC em três entidades:
  - `Reservation` — um `EMPLOYEE` acessa as reservas que ele registrou **ou** as dos veículos sob sua responsabilidade;
  - `Payment` — apenas os pagamentos que ele registrou;
  - `VehicleBooking` — apenas os veículos sob sua responsabilidade.

  Um `ADM` enxerga tudo da organização. Quando o escopo nega acesso, a resposta é **`404`, não `403`** — a decisão evita confirmar a existência de um recurso alheio.
- `ValidationPipe` global com `whitelist`, `transform` e `forbidNonWhitelisted`: campos não declarados no DTO fazem a requisição ser rejeitada em vez de serem silenciosamente ignorados.
- CORS restrito às origens listadas em `CORS_ORIGIN`.

### No frontend

- O **access token vive apenas em memória** (store Zustand); somente o refresh token é persistido em `localStorage`.
- No boot da aplicação, o refresh token é trocado por um access token novo antes de qualquer renderização autenticada.
- Um interceptor Axios injeta o `Authorization` e, ao receber `401`, dispara o refresh **compartilhando uma única promise entre requisições concorrentes** (single-flight), reexecutando as chamadas originais em seguida. Falha no refresh limpa a sessão.
- `PrivateRoute`, `PublicRoute` e `AdminRoute` controlam a navegação; a sidebar oculta itens administrativos para `EMPLOYEE`. Esses controles são **reforço de UX** — a autorização efetiva é sempre a do backend.

---

## Regras de negócio

As regras abaixo estão implementadas na camada de service e cobertas por testes.

**Isolamento multi-tenant.** Nenhuma rota aceita `organizationId` no corpo. O valor é sempre lido do JWT e aplicado como filtro em toda consulta e como valor em toda escrita. Referências cruzadas (por exemplo, o `eventId` informado ao criar uma excursão) são validadas contra a organização do usuário antes de qualquer persistência.

**Gate por status da excursão.** `VehicleBooking` e `Reservation` só podem ser criados enquanto a excursão está em `PLANNING` ou `OPEN`. Em `CLOSED`, `DONE` ou `CANCELED` a criação é bloqueada. `Expense` é a exceção deliberada: uma despesa pode ser lançada em qualquer status, porque custos costumam chegar depois do encerramento da viagem.

**Capacidade do veículo.** O número de reservas ativas é confrontado com a `capacity` do veículo na criação da reserva e nas transições que passam a ocupar vaga (`WAITLIST → PENDING/CONFIRMED`).

**Sincronização pagamento ↔ status da reserva.** Ao registrar um pagamento, o total pago é recalculado sobre o histórico completo (lançamentos `PAYMENT` somam, `REVERSAL` subtraem) e o status da reserva é ajustado: `≥ 100%` do valor acordado → `CONFIRMED`; `≥ 50%` → `PENDING`; abaixo disso → `WAITLIST`. A regra é **bidirecional** — um estorno rebaixa a reserva. Reservas canceladas e excursões já finalizadas ou canceladas ficam fora dessa sincronização.

**Transições manuais também exigem lastro financeiro.** Promover manualmente uma reserva via `/pending` ou `/confirm` valida o mesmo percentual (50% e 100%), impedindo confirmar alguém que não pagou.

**Duplicidade de reserva por evento.** Um cliente não pode ter duas reservas ativas para o mesmo **evento** — a checagem atravessa a cadeia `Reservation → VehicleBooking → Excursion → Event`, e não apenas o veículo. Isso impede que o mesmo passageiro ocupe vaga em dois ônibus da mesma viagem.

**Cancelamentos exigem motivo.** Tanto o cancelamento de excursão quanto o de reserva exigem `cancelReason`, e ambos registram `canceledAt` — o histórico fica auditável em vez de o registro simplesmente sumir.

**Dinheiro em centavos.** Todo campo monetário trafega e é persistido como inteiro. O frontend converte para reais apenas na exibição e de volta para centavos no envio.

**Unicidade escopada.** CPF e CNPJ são únicos **dentro da organização**, não globalmente — organizações distintas podem cadastrar o mesmo passageiro. O e-mail de usuário, por ser credencial de login, é globalmente único.

---

## Como executar o projeto

### 1. Pré-requisitos

- **Node.js** ≥ 20
- **pnpm** 10.19.0 (fixado em `packageManager`)
- **PostgreSQL** em execução

### 2. Clone e instalação

```bash
git clone https://github.com/RafaelMedeirosDev/excursion-trip.git
cd excursion-trip
pnpm install
```

### 3. Variáveis de ambiente

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```

Edite `apps/backend/.env` com a URL do seu banco e **defina um `JWT_SECRET` próprio** — a aplicação se recusa a iniciar com o valor placeholder.

### 4. Prisma Client

```bash
pnpm --filter @excursion-trip/backend exec prisma generate
```

> Este passo é necessário porque, no layout de workspace do pnpm, o `postinstall` do `@prisma/client` não localiza o `schema.prisma`. O CI executa exatamente este comando antes do build.

### 5. Migrations

```bash
pnpm --filter @excursion-trip/backend exec prisma migrate dev
```

### 6. Execução

```bash
pnpm dev
```

O Turborepo sobe os dois apps em paralelo: **API em `http://localhost:3000`** e **frontend em `http://localhost:3001`**.

Para rodar isoladamente:

```bash
pnpm --filter @excursion-trip/backend dev
pnpm --filter @excursion-trip/frontend dev
```

### 7. Primeiro acesso

> **Atenção:** o projeto **não possui seed** e `POST /organizations` e `POST /users` exigem um `ADM` já autenticado — não existe cadastro público, por decisão de segurança. Portanto, a **primeira organização e o primeiro usuário `ADM` precisam ser inseridos manualmente no banco** (a senha deve ser gravada já como hash bcrypt). A partir daí, todo o restante é criado pela aplicação.

### 8. Testes

```bash
pnpm test                                     # via Turborepo (executa a suíte do backend)
pnpm --filter @excursion-trip/backend test
pnpm --filter @excursion-trip/backend test:watch
```

Os testes usam mocks dos repositórios e **não requerem banco de dados**.

### 9. Build e qualidade

```bash
pnpm build
pnpm lint
```

---

## Variáveis de ambiente

### Backend — `apps/backend/.env`

```env
DATABASE_URL=""                      # string de conexão PostgreSQL
JWT_SECRET=""                        # obrigatório; a app não sobe com o placeholder
JWT_EXPIRES_IN=""                    # ex.: "15m"
REFRESH_TOKEN_EXPIRES_IN_HOURS=""    # ex.: "10"
PORT=""                              # padrão 3000 se ausente
CORS_ORIGIN=""                       # origens permitidas, separadas por vírgula
```

### Frontend — `apps/frontend/.env`

```env
VITE_API_URL=""                      # URL base da API, ex.: http://localhost:3000
```

Ambos os apps trazem um `.env.example` versionado com as chaves e valores de referência para desenvolvimento local. Os arquivos `.env` reais estão no `.gitignore` e nunca devem ser commitados.

---

## Scripts disponíveis

### Raiz (Turborepo)

| Script | Descrição |
| --- | --- |
| `pnpm dev` | Sobe backend e frontend em modo desenvolvimento |
| `pnpm build` | Gera o build de todos os pacotes, respeitando o grafo de dependências |
| `pnpm lint` | Executa o ESLint em todos os pacotes |
| `pnpm test` | Executa as suítes de teste do monorepo |

> Como o frontend não declara um script `test`, `pnpm test` na raiz executa efetivamente a suíte Jest do backend.

### Backend — `apps/backend`

| Script | Descrição |
| --- | --- |
| `pnpm dev` | Sobe a API em modo watch (`nest start --watch`) |
| `pnpm build` | Compila a API (`nest build`) |
| `pnpm start` | Executa o build compilado (`node dist/main.js`) |
| `pnpm lint` | ESLint sobre `src/**/*.ts` |
| `pnpm test` | Executa a suíte Jest |
| `pnpm test:watch` | Jest em modo watch |

### Frontend — `apps/frontend`

| Script | Descrição |
| --- | --- |
| `pnpm dev` | Sobe o dev server do Vite na porta 3001 |
| `pnpm build` | Type check com `tsc -b` seguido do build do Vite |
| `pnpm preview` | Serve localmente o build de produção |
| `pnpm lint` | ESLint sobre `src/**/*.{ts,tsx}` |

---

## Status do projeto

**Em desenvolvimento ativo — funcional e demonstrável.** O domínio está modelado por completo e o fluxo operacional principal (evento → excursão → veículo → reserva → pagamento) roda de ponta a ponta, do backend à interface. O escopo de escrita foi deliberadamente concentrado em **criação e transições de status**, priorizando profundidade de regra de negócio sobre amplitude de CRUD.

### O que está implementado

- Schema completo com 12 entidades e 15 migrations aplicadas.
- Criação, listagem e consulta por ID nas 11 entidades de negócio (`Organization` apenas com criação).
- Autenticação JWT com refresh token rotativo, revogação e rate limit.
- RBAC por papel e escopo por linha em reservas, pagamentos e veículos.
- Máquinas de estado de excursão e de reserva, com validação financeira nas transições.
- Sincronização automática e bidirecional entre pagamentos e status da reserva.
- 155 testes unitários na camada de service.
- CI executando build, lint e testes em todo pull request.
- Frontend com listagem, detalhe e criação para 10 domínios, layout responsivo e tratamento de erros da API.

### O que está parcial ou pendente

- **Sem atualização genérica e sem exclusão**: as únicas mutações após a criação são as transições de status. Editar o nome de um evento ou remover um cadastro ainda não é possível pela API.
- **Soft delete preparado, não ativo**: a coluna `deletedAt` existe e é filtrada nas listagens, mas nenhuma rota a preenche.
- **Listagens sem paginação e sem ordenação**: todos os endpoints de lista retornam o conjunto completo. Buscas e filtros textuais do frontend são resolvidos no cliente — adequado ao volume atual, mas não à escala.
- **Documentação OpenAPI não exposta**: `@nestjs/swagger` está presente, mas sem `SwaggerModule.setup`.
- **Sem seed de bootstrap**: a primeira organização e o primeiro `ADM` exigem inserção manual no banco.
- **Cobertura de testes concentrada na camada de service**: não há testes de controller, de repositório, end-to-end, nem testes no frontend.
- **Módulo de despesas sem interface**: `Expense` existe na API, mas ainda não tem tela no frontend.
- **Sem containerização e sem deploy**: não há Dockerfile, `docker-compose` nem ambiente publicado — a execução é local.

---

## Aprendizados e pontos técnicos demonstrados

- Desenvolvimento backend com **TypeScript em modo estrito** e NestJS, aplicando injeção de dependência e inversão de controle de forma consistente.
- **Arquitetura em camadas com fronteira real**: contratos abstratos em `domain` isolam os casos de uso do Prisma, deixando os services testáveis sem banco.
- **Modelagem relacional** com Prisma: constraints compostas escopadas por tenant, índices em chaves estrangeiras e migrations versionadas desde a primeira versão.
- **Autenticação e sessão seguras**: senha com bcrypt, refresh token opaco armazenado apenas como hash, rotação a cada uso e revogação por sessão.
- **Autorização em profundidade**: papéis via guard declarativo e escopo por linha na camada de dados, com resposta `404` em vez de `403` para não vazar existência de recursos.
- **Modelagem de regras de negócio como máquinas de estado explícitas**, em vez de condicionais espalhadas — cada transição é um caso de uso próprio, com seus testes.
- **Design de arquitetura multi-tenant** com isolamento derivado do token, não do cliente.
- **Precisão financeira** com inteiros em centavos em toda a stack.
- **Testes unitários orientados a regra**: cada erro de negócio tem um teste que prova que ele é lançado.
- **Organização de monorepo** com pnpm workspaces e Turborepo, configuração compartilhada e pipeline de CI que impede merge com build, lint ou teste quebrado.
- **Frontend consumindo a própria API**: cache e invalidação com TanStack Query, formulários validados por schema e fluxo de refresh token resiliente a requisições concorrentes.

---

## Melhorias futuras

- Expor a documentação da API em OpenAPI/Swagger, aproveitando os decorators já presentes.
- Implementar atualização e exclusão das entidades, ativando o soft delete já modelado.
- Adicionar paginação, ordenação e filtros server-side nas listagens.
- Criar um seed de bootstrap para a primeira organização e o primeiro usuário `ADM`.
- Envolver escritas correlatas em transações do Prisma (por exemplo, criar o pagamento e atualizar o status da reserva).
- Adicionar um filtro global de exceções para traduzir erros do Prisma em respostas HTTP consistentes.
- Ampliar a cobertura de testes para controllers, repositórios e cenários end-to-end, e introduzir testes no frontend.
- Criar tela de despesas, completando a paridade com a API.
- Adicionar `docker-compose` para subir banco e aplicação com um comando.
- Publicar um ambiente de demonstração e incluir screenshots no README.
- Adicionar logging estruturado e observabilidade.
- Incluir um arquivo de licença.

---

## Autor

Desenvolvido por **Rafael Medeiros**.

GitHub: [@RafaelMedeirosDev](https://github.com/RafaelMedeirosDev)
