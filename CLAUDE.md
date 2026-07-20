# Gestão de Excursões

Monorepo (Turborepo + pnpm) para um SaaS de gestão de excursões para eventos. Organizadores cadastram excursões, eventos, veículos, passageiros, reservas, pagamentos e pontos de embarque.

## Estrutura

```
excursion-trip/
├── apps/
│   ├── backend/     # API NestJS + Prisma — ver apps/backend/CLAUDE.md
│   └── frontend/     # reservado, framework ainda não escolhido
├── packages/
│   ├── config/        # tsconfig e eslint base compartilhados
│   └── shared/         # tipos/enums compartilhados entre backend e frontend (ainda vazio)
```

## Stack

TypeScript, Node.js 20, pnpm workspaces, Turborepo, NestJS, Prisma ORM, PostgreSQL.

## Comandos (raiz)

```bash
pnpm install
pnpm dev      # turbo run dev em todos os apps
pnpm build    # turbo run build
pnpm lint     # turbo run lint
pnpm test     # turbo run test
```

## CI

`.github/workflows/ci.yml` roda `pnpm build && pnpm lint && pnpm test` em todo Pull Request pra `main` (GitHub Actions, Node 20 + pnpm, sem banco — os testes do backend só usam mocks de `Repository`, não tocam Postgres). **`pnpm install` sozinho não gera o Prisma Client nesse monorepo** (postinstall do `@prisma/client` não encontra o `schema.prisma` no layout do pnpm workspace) — o workflow roda `pnpm --filter @excursion-trip/backend exec prisma generate` explicitamente antes do build. Localmente isso nunca foi um problema porque `prisma migrate dev` já gera o client como efeito colateral; um clone novo que só rode `pnpm install` (como o CI) precisa desse passo explícito.

## Estado atual

- Scaffold do monorepo pronto (workspaces, tsconfig/eslint compartilhados, NestJS rodando).
- **`prisma/schema.prisma` completo e migrado** (11 models — ver `apps/backend/CLAUDE.md` para a lista e o estado de cada entidade).
- **Todas as 11 entidades do schema têm `create` implementado** (`Organization`, `User`, `Customer`, `Event`, `Excursion`, `Supplier`, `VehicleBooking`, `Expense`, `BoardingPoint`, `Reservation` e `Payment` — domínio completo). **10 das 11 também têm `list`** (todas exceto `Organization`, que não foi pedido): `GET /users`, `GET /customers`, `GET /events`, `GET /excursions`, `GET /suppliers`, `GET /vehicle-bookings`, `GET /expenses`, `GET /boarding-points`, `GET /reservations`, `GET /payments` — ver `apps/backend/CLAUDE.md` pro padrão completo, incluindo o escopo por linha usado em `Reservation`/`Payment` (`EMPLOYEE` só vê o que ele mesmo registrou, `ADM` vê tudo). **`Excursion` também tem `update` de status**: `PATCH /excursions/:id/status` (`ADM`-only), primeiro `update` do projeto, com máquina de estados fixa (`PLANNING→OPEN→CLOSED→DONE`, `CANCELED` de qualquer um menos `DONE`) — ver `apps/backend/CLAUDE.md`. **`VehicleBooking` e `Reservation` só podem ser criados com a excursão em `PLANNING`/`OPEN`** (bloqueado em `CLOSED`/`DONE`/`CANCELED`); `Expense` continua liberado em qualquer status — ver `apps/backend/CLAUDE.md`. **`Reservation` também tem ciclo de vida de status**: `POST /reservations/:id/pending`/`POST /reservations/:id/confirm`/`POST /reservations/:id/cancel` (qualquer autenticado, escopado por linha — `EMPLOYEE` só mexe nas próprias), `WAITLIST→PENDING→CONFIRMED` validado automaticamente contra a soma de `Payment`s (50%/100% do `agreedValue`) — ver `apps/backend/CLAUDE.md`. **As mesmas 10 entidades com `list` também têm `GET /:id`** (recurso único, entidade crua sem relations, mesmo `@Roles`/escopo por linha do `list` de cada uma) — ver `apps/backend/CLAUDE.md`. Não implemente `update`/`delete` das demais entidades nem `list` de `Organization` especulativamente, espere pedido explícito.
- **Login (JWT) implementado e rotas protegidas**: `POST /auth/login`/`POST /auth/refresh`/`POST /auth/logout` são as únicas rotas públicas. `accessToken` expira em 15min, `refreshToken` (opaco, não-JWT) em 24h, com rotação a cada uso — ver `apps/backend/CLAUDE.md`. `POST /organizations`/`POST /users`/`POST /events`/`POST /excursions`/`POST /suppliers`/`POST /vehicle-bookings`/`POST /boarding-points` exigem `ADM` autenticado; `POST /customers`/`POST /expenses`/`POST /reservations`/`POST /payments` aceitam qualquer autenticado (`ADM` ou `EMPLOYEE`). Não existe signup público — organizações novas são criadas manualmente por um ADM já existente.
- **Todo campo monetário é `Int` em centavos, nunca `Decimal`** (R$ 50,50 = `5050`) — ver `apps/backend/CLAUDE.md` para detalhes.

## Backend

A arquitetura em camadas do backend (Controller → Service → Domain/External), convenções de nomenclatura e templates de código vivem em `apps/backend/CLAUDE.md` e nas skills de `apps/backend/.claude/skills/`. Sempre consulte a skill da camada correspondente (`controller`, `domain`, `service`, `external`, `dto`, `erros`, `tools`) antes de gerar código nessa camada — elas são a fonte de verdade sobre convenções, não este arquivo. Não existe skill `module`: o registro em `app.module.ts` é feito inline ao final de cada camada, conforme descrito em `apps/backend/CLAUDE.md`.
