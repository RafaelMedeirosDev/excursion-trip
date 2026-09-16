# Gestão de Excursões

Monorepo (Turborepo + pnpm) para um SaaS de gestão de excursões para eventos. Organizadores cadastram excursões, eventos, veículos, passageiros, reservas, pagamentos e pontos de embarque.

## Estrutura

```
excursion-trip/
├── apps/
│   ├── backend/     # API NestJS + Prisma — ver apps/backend/CLAUDE.md
│   └── frontend/     # SPA React + Vite — ver apps/frontend/CLAUDE.md
├── packages/
│   ├── config/        # tsconfig e eslint base compartilhados
│   └── shared/         # tipos/enums espelhados pro frontend não redeclarar (ver nota abaixo)
```

**`packages/shared`**: usado só pelo frontend (`workspace:*` em `dependencies`, não `devDependencies` — é import em tempo de execução), pra centralizar tipos/enums que o frontend precisaria redeclarar em cada `features/{módulo}` (ex.: `UF`). **O backend não depende desse pacote** — continua usando os enums gerados por `@prisma/client` normalmente, que são a fonte de verdade real (`schema.prisma`); enums do Prisma são `enum` TS nominal, não união de literais, então não dá pra backend importar o tipo do `shared` e passar direto pro Prisma sem fricção. Os valores em `packages/shared` são mantidos manualmente em sincronia com o `schema.prisma` (mesmo princípio de nunca redeclarar um enum à mão, só que agora centralizado num lugar em vez de espalhado por `features/*/types`). Nem todo enum do projeto está lá — `ExcursionStatus`/`Role`, que já existiam duplicados em módulos mergeados antes do `shared` existir de fato, continuam como estão; migrar os dois é cleanup futuro, não foi bundlado na primeira feature que usou o pacote.

## Stack

TypeScript, Node.js 20, pnpm workspaces, Turborepo, NestJS, Prisma ORM, PostgreSQL, React (Vite) + Tailwind CSS + shadcn/ui.

## Comandos (raiz)

```bash
pnpm install
pnpm dev      # turbo run dev em todos os apps
pnpm build    # turbo run build
pnpm lint     # turbo run lint
pnpm test     # turbo run test
```

## CI

`.github/workflows/ci.yml` roda `pnpm build && pnpm lint && pnpm test` em todo Pull Request pra `main` (GitHub Actions, Node 20 + pnpm). O job `ci` continua **sem banco** — os testes unitários do backend só usam mocks de `Repository`. Em paralelo roda o job `integration`, com um serviço Postgres 15 e `pnpm --filter @excursion-trip/backend test:int`: são os testes que precisam de banco de verdade (hoje, a corrida de capacidade do veículo). Rodam em paralelo de propósito, então o tempo total do PR não muda. **`pnpm install` sozinho não gera o Prisma Client nesse monorepo** (postinstall do `@prisma/client` não encontra o `schema.prisma` no layout do pnpm workspace) — o workflow roda `pnpm --filter @excursion-trip/backend exec prisma generate` explicitamente antes do build. Localmente isso nunca foi um problema porque `prisma migrate dev` já gera o client como efeito colateral; um clone novo que só rode `pnpm install` (como o CI) precisa desse passo explícito.

## Deploy (Railway)

Projeto `thriving-connection`, ambiente `production`, 3 serviços: `Postgres` (gerenciado, com volume), `backend` e `frontend` — os dois últimos apontando para **o mesmo repositório**, sem Dockerfile. O builder é o **Railpack** (sucessor do Nixpacks; variáveis são `RAILPACK_*`). `railway.json`/`railway.toml` **não são opção**: config-as-code está deprecado e fechado para serviços novos — a configuração vive no painel.

**Root Directory tem que ficar vazio nos dois serviços.** Este é um "shared monorepo" (pnpm workspace com `workspace:*`): com Root Directory preenchido, o Railway baixa só aquele diretório e `pnpm-workspace.yaml`/`pnpm-lock.yaml`/`packages/shared` ficam de fora, quebrando o build na resolução de módulo. Os serviços se diferenciam pelos **comandos**, não pelo diretório.

| | `backend` | `frontend` |
|---|---|---|
| Build | `pnpm --filter @excursion-trip/backend exec prisma generate && pnpm --filter @excursion-trip/backend build` | `pnpm --filter @excursion-trip/frontend build` |
| Pre-deploy | `pnpm --filter @excursion-trip/backend exec prisma migrate deploy` | — |
| Start | `pnpm --filter @excursion-trip/backend start` | *(vazio — quem serve é o Caddy)* |
| Healthcheck | `/health` | `/health` |

- **`prisma generate` precisa estar explícito no build** — não existe `postinstall` em nenhum `package.json` do monorepo (mesmo motivo pelo qual o `ci.yml` já roda esse passo à mão).
- **A migration roda no pre-deploy**, que executa entre build e deploy, tem acesso à rede privada e **aborta o deploy se falhar** — o tráfego nunca chega numa versão cujo schema não subiu. O CLI `prisma` é `devDependency` mas continua na imagem porque o prune de devDeps é opt-in: **nunca habilitar `RAILPACK_PRUNE_DEPS`**, isso quebraria o pre-deploy.
- **O frontend é servido como site estático pelo Caddy do Railpack**, cujo Caddyfile padrão já faz `try_files … /index.html` (resolve os deep links do `BrowserRouter`) e responde `/health`. Sem `serve`, sem nginx, sem `vite preview` — nenhuma dependência nova. **Mas a autodetecção de Vite não dispara neste monorepo**: o Railpack inspeciona só o `package.json` da raiz, que não tem Vite. É obrigatório forçar com `RAILPACK_SPA_OUTPUT_DIR=apps/frontend/dist` (caminho relativo à raiz do repo), e deixar o Start Command **vazio** — `apps/frontend` não tem script `start`.

### Variáveis

`backend`: `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `JWT_SECRET` (forte, o boot rejeita `change-me`), `JWT_EXPIRES_IN=15m`, `REFRESH_TOKEN_EXPIRES_IN_HOURS=24`, `CORS_ORIGIN=https://<domínio do frontend>`, `RAILPACK_NODE_VERSION=20`.
`frontend`: `VITE_API_URL=https://<domínio do backend>`, `RAILPACK_SPA_OUTPUT_DIR=apps/frontend/dist`, `RAILPACK_NODE_VERSION=20`.

- **`PORT` é injetada pelo Railway — nunca setar à mão.** E `main.ts` precisa bindar em `0.0.0.0` explicitamente (`app.listen(port, "0.0.0.0")`), senão o resultado é `502 Application failed to respond`.
- **`VITE_API_URL` é build-time**: o Vite inlina o valor no bundle, então trocar o domínio da API exige **rebuild** do frontend, não basta reiniciar.
- **`RAILPACK_NODE_VERSION=20` é proposital**: `engines.node` da raiz é o range `>=20`, que poderia resolver para 22/24 — o Nest 10 e o CI usam 20.
- **`DATABASE_URL` errada = crash loop**, não degradação silenciosa: `PrismaRemoteRepository.onModuleInit` chama `$connect()`, então o processo morre no boot se o banco estiver inacessível.

### Três armadilhas que já custaram caro

1. **`onlyBuiltDependencies` mora no `pnpm-workspace.yaml`, não no `package.json`.** Desde o pnpm 10.16 o campo `pnpm` do `package.json` é **silenciosamente ignorado** (o pnpm avisa, mas nada quebra). Sem a lista no lugar certo, o pnpm 10 bloqueia os install scripts e o `bcrypt` fica sem binário nativo — e isso **não aparece nem no CI** (todos os `.spec.ts` fazem `jest.mock('bcrypt')`, o binário nunca é carregado em teste). A falha só apareceria no primeiro `POST /auth/login` em produção.
2. **As guardas de boot de `main.ts` não dão para testar localmente do jeito óbvio.** `ConfigModule.forRoot()` é avaliado no `require` de `app.module.ts`, ou seja **antes** do `bootstrap()`, e carrega `apps/backend/.env` independentemente do `cwd` — então `env -u CORS_ORIGIN node dist/main.js` sobe normalmente na sua máquina. Para testar de verdade é preciso esconder o `.env` temporariamente. Em produção o arquivo não existe (é gitignored), então as guardas valem.
3. **Nome de serviço vira namespace de variável de referência** (`${{backend.RAILWAY_PUBLIC_DOMAIN}}`). O import automático de monorepo nomeia os serviços como os pacotes (`@excursion-trip/backend`), e `@`/`/` não são válidos nessa sintaxe — por isso os serviços foram renomeados para `backend`/`frontend`. `RAILWAY_PUBLIC_DOMAIN` **não** inclui o `https://`.

### Bootstrap e operação

Não existe signup público, então a primeira organização e o primeiro `ADM` de um cliente real são inseridos à mão (`railway connect Postgres`, hash bcrypt com `SALT_ROUNDS = 10`).

**`prisma/seed.ts` é o seed da organização de demonstração, e pode rodar em produção.** Ele cria/atualiza uma organização de id fixo (`0a000000-…-000000000001`, "Excursões Panorama — Demo") com ~85 registros realistas, para alguém de fora conhecer o sistema. Três coisas que o tornam seguro e que não podem se perder numa edição futura:

- **A identidade da organização é um literal do código, nunca uma query.** A versão original fazia `findFirst({ orderBy: { createdAt: 'asc' } })` e "reaproveitava a organização existente" — o que em produção significa despejar 85 registros fictícios e 3 usuários (um deles `ADM` com senha pública) dentro do tenant de um cliente real.
- **`cnpj` da organização de demo é `null` de propósito.** O campo é `@unique` global; no Postgres vários `NULL` convivem numa constraint `UNIQUE`, então não há como colidir com a organização real nem com bancos de dev já semeados.
- **Datas são todas relativas a "hoje 00:00 UTC"** (`monthsFromNow`/`addDays`), nunca literais. Com datas fixas a demo envelhece: o card de Eventos do Dashboard separa "Próximos" de "Realizados" comparando com `now`, e a partir de certa data o grupo "Próximos" zera para sempre. Mesma razão pela qual os nomes dos eventos não têm ano nem sazonalidade ("Festival Rio Live", não "Rock in Rio 2026" ou "Réveillon"). `canceledAt` sempre ancora em `daysFromNow(negativo)` — derivá-lo da data de embarque produziria cancelamento no futuro.

`SEED_RESET=1 pnpm --filter @excursion-trip/backend db:seed` apaga tudo da demo antes de semear, restaurando o estado inicial mesmo depois de um visitante criar ou excluir registros. É o **único** caminho destrutivo do arquivo: escopado pelo id literal da demo, em `$transaction`, com a ordem topológica das FKs. Duas armadilhas documentadas no código: `RefreshToken` não tem `organizationId` nem cascade (precisa ser escopado pela relação com `User`, senão o delete falha para qualquer usuário que já tenha logado), e as relações **opcionais** (`Reservation.boardingPointId`, `Expense.vehicleBookingId`) têm default `SetNull` — apagar fora de ordem não daria erro, só zeraria campos em silêncio. **Nunca colocar `SEED_RESET` no `.env`**: o CLI do Prisma carrega o `.env` antes do seed, e um valor esquecido lá tornaria toda execução destrutiva.

`User`/`Supplier`/`Customer` usam **id fixo** no `upsert`, não a chave natural (`email`/`cnpj`/`cpf`) — desde que `PATCH /users/:id`, `/customers/:id` e `/suppliers/:id` existem, o visitante (que é `ADM`) pode editar esses campos, e casar por chave natural faria o seed criar duplicata em vez de corrigir a linha.

### Cron de restauração da demo

Serviço `demo-reset` (mesmo repositório, sem domínio nem healthcheck) roda `SEED_RESET=1 … db:seed` **todo dia às 06:00 UTC** (03:00 em Brasília) — o schedule do Railway é sempre UTC. Build só faz `prisma generate` (o seed roda por `ts-node`, não precisa do `nest build`), e o `DATABASE_URL` vem da **rede privada** (`Postgres.env.DATABASE_URL`), não do proxy público: cron roda dentro do Railway, mesmo caminho que o `preDeployCommand` das migrations já usa.

Três exigências da plataforma que não podem ser perdidas numa edição futura:

- **O processo precisa terminar.** A doc é explícita: se uma execução ainda estiver rodando quando a próxima vencer, o Railway **pula** a nova. Um cron que fica `Active` nunca mais dispara. O `seed.ts` já fecha com `prisma.$disconnect()` no `finally` — medido: encerra com exit 0 em ~3s, sem processo órfão. Depois de rodar, o serviço aparece como `Completed` com `replicas: 0/1`.
- **`restartPolicyType: "NEVER"`.** Com qualquer outra política o Railway reiniciaria o container ao vê-lo sair, e recairia no problema acima.
- **Intervalo mínimo de 5 minutos**, e o horário varia alguns minutos (verificado: agendado 20:10 UTC, executou 20:13).

**`SEED_RESET=1` é variável desse serviço, e só dele** — nunca do backend, e nunca do `.env`. É o que torna seguro: o `demo-reset` não faz mais nada além de restaurar a demo.

Testado de ponta a ponta em produção: excursão renomeada, passageiro criado e passageiro excluído de propósito; o cron rodou e devolveu os 10 contadores ao estado original, com a organização real intacta.

Watch paths separam os deploys: `backend` observa `/apps/backend/**` + `/packages/**` + lockfile/manifests da raiz; `frontend` troca o primeiro por `/apps/frontend/**`. Um commit que toque só um app redeploya só aquele serviço.

## Estado atual

- Scaffold do monorepo pronto (workspaces, tsconfig/eslint compartilhados, NestJS rodando).
- **`prisma/schema.prisma` completo e migrado** (11 models — ver `apps/backend/CLAUDE.md` para a lista e o estado de cada entidade).
- **Todas as 11 entidades do schema têm `create` implementado** (`Organization`, `User`, `Customer`, `Event`, `Excursion`, `Supplier`, `VehicleBooking`, `Expense`, `BoardingPoint`, `Reservation` e `Payment` — domínio completo). **10 das 11 também têm `list`** (todas exceto `Organization`, que não foi pedido): `GET /users`, `GET /customers`, `GET /events`, `GET /excursions`, `GET /suppliers`, `GET /vehicle-bookings`, `GET /expenses`, `GET /boarding-points`, `GET /reservations`, `GET /payments` — ver `apps/backend/CLAUDE.md` pro padrão completo, incluindo o escopo por linha usado em `Reservation`/`Payment` (`EMPLOYEE` só vê o que ele mesmo registrou, `ADM` vê tudo). **`Excursion` também tem `update` de status**: `PATCH /excursions/:id/status` (`ADM`-only), primeiro `update` do projeto, com máquina de estados fixa (`PLANNING→OPEN→CLOSED→DONE`, `CANCELED` de qualquer um menos `DONE`) — ver `apps/backend/CLAUDE.md`. **`VehicleBooking` e `Reservation` só podem ser criados com a excursão em `PLANNING`/`OPEN`** (bloqueado em `CLOSED`/`DONE`/`CANCELED`); `Expense` continua liberado em qualquer status — ver `apps/backend/CLAUDE.md`. **`Reservation` também tem ciclo de vida de status**: `POST /reservations/:id/pending`/`POST /reservations/:id/confirm`/`POST /reservations/:id/cancel` (qualquer autenticado, escopado por linha — `EMPLOYEE` só mexe nas próprias), `WAITLIST→PENDING→CONFIRMED` validado automaticamente contra a soma de `Payment`s (50%/100% do `agreedValue`) — ver `apps/backend/CLAUDE.md`. **As mesmas 10 entidades com `list` também têm `GET /:id`** (recurso único, entidade crua sem relations, mesmo `@Roles`/escopo por linha do `list` de cada uma) — ver `apps/backend/CLAUDE.md`. Não implemente `update`/`delete` das demais entidades nem `list` de `Organization` especulativamente, espere pedido explícito.
- **Login (JWT) implementado e rotas protegidas**: `POST /auth/login`/`POST /auth/refresh`/`POST /auth/logout` são as únicas rotas públicas. `accessToken` expira em 15min, `refreshToken` (opaco, não-JWT) em 24h, com rotação a cada uso — ver `apps/backend/CLAUDE.md`. `POST /organizations`/`POST /users`/`POST /events`/`POST /excursions`/`POST /suppliers`/`POST /vehicle-bookings`/`POST /boarding-points` exigem `ADM` autenticado; `POST /customers`/`POST /expenses`/`POST /reservations`/`POST /payments` aceitam qualquer autenticado (`ADM` ou `EMPLOYEE`). Não existe signup público — organizações novas são criadas manualmente por um ADM já existente.
- **Todo campo monetário é `Int` em centavos, nunca `Decimal`** (R$ 50,50 = `5050`) — ver `apps/backend/CLAUDE.md` para detalhes.

## Backend

A arquitetura em camadas do backend (Controller → Service → Domain/External), convenções de nomenclatura e templates de código vivem em `apps/backend/CLAUDE.md` e nas skills de `apps/backend/.claude/skills/`. Sempre consulte a skill da camada correspondente (`controller`, `domain`, `service`, `external`, `dto`, `erros`, `tools`) antes de gerar código nessa camada — elas são a fonte de verdade sobre convenções, não este arquivo. Não existe skill `module`: o registro em `app.module.ts` é feito inline ao final de cada camada, conforme descrito em `apps/backend/CLAUDE.md`.

## Frontend

Estrutura por domínio (`features/{módulo}/`), não por tipo — cada domínio concentra sua própria `api`/`components`/`hooks`/`pages`, camada compartilhada (`components/ui`, `services/http`, `store`) enxuta. Detalhes completos (arquitetura, auth, shadcn/ui, estado atual por módulo) em `apps/frontend/CLAUDE.md`. Mesmo fluxo de trabalho do backend: 1 branch por feature/módulo, usuário testa antes do commit/push.
