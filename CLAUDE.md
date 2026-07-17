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
```

## Estado atual

- Scaffold do monorepo pronto (workspaces, tsconfig/eslint compartilhados, NestJS rodando).
- **`prisma/schema.prisma` completo e migrado** (11 models — ver `apps/backend/CLAUDE.md` para a lista e o estado de cada entidade).
- **Todas as 11 entidades do schema têm `create` implementado** (`Organization`, `User`, `Customer`, `Event`, `Excursion`, `Supplier`, `VehicleBooking`, `Expense`, `BoardingPoint`, `Reservation` e `Payment` — domínio completo). `User`, `Customer`, `Event`, `Excursion`, `Supplier`, `VehicleBooking`, `Expense` e `BoardingPoint` também têm `list` (`GET /users`, `GET /customers`, `GET /events`, `GET /excursions`, `GET /suppliers`, `GET /vehicle-bookings`, `GET /expenses`, `GET /boarding-points`) — ver `apps/backend/CLAUDE.md` pro padrão a seguir em próximos `list`. Não implemente `list`/`update`/`delete` especulativamente pras demais entidades, espere pedido explícito.
- **Login (JWT) implementado e rotas protegidas**: `POST /auth/login` é a única rota pública. `POST /organizations`/`POST /users`/`POST /events`/`POST /excursions`/`POST /suppliers`/`POST /vehicle-bookings`/`POST /boarding-points` exigem `ADM` autenticado; `POST /customers`/`POST /expenses`/`POST /reservations`/`POST /payments` aceitam qualquer autenticado (`ADM` ou `EMPLOYEE`). Não existe signup público — organizações novas são criadas manualmente por um ADM já existente.
- **Todo campo monetário é `Int` em centavos, nunca `Decimal`** (R$ 50,50 = `5050`) — ver `apps/backend/CLAUDE.md` para detalhes.

## Backend

A arquitetura em camadas do backend (Controller → Service → Domain/External), convenções de nomenclatura e templates de código vivem em `apps/backend/CLAUDE.md` e nas skills de `apps/backend/.claude/skills/`. Sempre consulte a skill da camada correspondente (`controller`, `domain`, `service`, `external`, `dto`, `erros`, `tools`) antes de gerar código nessa camada — elas são a fonte de verdade sobre convenções, não este arquivo. Não existe skill `module`: o registro em `app.module.ts` é feito inline ao final de cada camada, conforme descrito em `apps/backend/CLAUDE.md`.
