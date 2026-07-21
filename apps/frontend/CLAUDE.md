# Frontend — Gestão de Excursões

SPA React consumindo a API NestJS de `apps/backend`. Este arquivo documenta o estado real da arquitetura do frontend — atualizar a cada feature, mesmo padrão do `apps/backend/CLAUDE.md`.

## Stack

Vite, React 19, TypeScript, Tailwind CSS (v3, formato clássico com `tailwind.config.ts` + CSS vars) + shadcn/ui, `react-router-dom`, `axios`, `@tanstack/react-query`, `zustand`, `class-variance-authority` + `clsx` + `tailwind-merge`, `lucide-react`, `react-hook-form` + `zod` + `@hookform/resolvers` (entraram na feature de `Events`, primeiro módulo com formulário de verdade).

## Estado atual

- **Bootstrap completo** (branch `feat/frontend-bootstrap`): Vite+React+TS rodando (`pnpm --filter @excursion-trip/frontend dev`, porta `3001` — mesma porta já configurada como `CORS_ORIGIN` no backend), Tailwind + base do shadcn/ui configurados, ESLint reaproveitando `packages/config/eslint.base.js` (mesmo padrão do backend) + plugins `react-hooks`/`react-refresh`.
- **Login funcional de ponta a ponta contra o backend real**: `LoginPage` → `POST /auth/login` → guarda `accessToken` (memória) + `refreshToken` (`localStorage`) → redireciona pro `Dashboard`, protegido por `PrivateRoute`. `Sair` chama `POST /auth/logout`. Testado via curl simulando as chamadas exatas do frontend (login, decode do JWT, refresh com rotação, preflight de CORS) — sem ferramenta de navegador disponível no ambiente de desenvolvimento assistido, então a renderização visual em si não foi conferida automaticamente, só a camada de rede/lógica.
- **Páginas existentes até agora**: `LoginPage` (`/login`), `DashboardPage` (`/`), `EventsPage`/`EventDetailsPage`/`CreateEventPage` (`/events`, `/events/:id`, `/events/new`), `NotFoundPage` (`*`). O resto dos módulos (Excursions, Passengers, Reservations, Payments, Vehicles, BoardingPoints, Users) ainda não foi implementado — vem em branches separadas, uma por módulo, mesmo fluxo do backend (implementa → usuário testa → confirma → só aí commit/push).
- **Shell visual completo** (branch `feat/app-shell`): `AppLayout` agora compõe `Sidebar` + `Header` de verdade (antes era um placeholder de uma linha). `Sidebar`: navegação agrupada (`Operacional`/`Administrativo`), lida de `constants/navigation.ts` — único arquivo a tocar quando um módulo novo virar rota de verdade (`implemented: false → true`). Itens ainda não implementados aparecem esmaecidos com badge "em breve", sem link — evita cair num 404. Itens `adminOnly: true` (Eventos, Veículos, Pontos de Embarque, Usuários) somem completamente da Sidebar pra `EMPLOYEE` (reforço de UX, não é a fonte de verdade de permissão — isso é o backend). Fixa no desktop, vira drawer com overlay em telas pequenas (`md:` breakpoint do Tailwind). `Header`: menu do usuário (`shadcn dropdown-menu`) com a `role` traduzida (`ADM`→"Administrador", `EMPLOYEE`→"Funcionário") e "Sair" — sem nome/e-mail, mesma limitação de JWT já documentada abaixo. `PageTitle` (`components/layout/PageTitle.tsx`) fica dentro do conteúdo de cada página, não no `Header` — cada página é dona do próprio título + ação opcional (ex.: botão "+ Novo" quando existir).

- **Módulo `Events` — primeiro módulo de domínio, vira o molde pros próximos** (branch `feat/events-module`): decisão do usuário de inverter a ordem original do plano (`Excursions` primeiro) — `Excursion.eventId` é obrigatório no backend, sem `Event` cadastrado não dá nem pra preencher o form de criar excursão. Backend só tem `create`/`list`/`get-by-id` pra `Event` (sem `update`), então **não existe `EditEventPage`** — mesma lacuna já documentada, não é esquecimento. Padrão por domínio replicável: `features/{domínio}/{api,types,validations,hooks,pages}` — `api/eventsApi.ts` (wrappers finos sobre `httpClient`), `validations/eventSchema.ts` (`zod`, espelha o DTO do backend campo a campo), `hooks/{useEvents,useEvent,useCreateEvent}.ts` (`TanStack Query`, `useCreateEvent` invalida a query de lista no sucesso), `pages/{EventsPage,EventDetailsPage,CreateEventPage}.tsx`. Form de criação usa `react-hook-form` + `zodResolver`, **sem componente `EventForm` separado** — só extrair quando existir um segundo consumidor de verdade (ex.: quando/se `Edit` existir), evita abstrair cedo demais.
- **`AdminRoute`** (`routes/AdminRoute.tsx`, novo — mesmo padrão de `PrivateRoute`/`PublicRoute`): guarda de rota por role, `<Navigate to="/" />` se `!hasRole('ADM')`. Antes só a `Sidebar` escondia o link pra `EMPLOYEE` — a rota em si ficava acessível digitando a URL direto. `Events` é o primeiro módulo a usar, mas é genérico — todo módulo `adminOnly` (Vehicles, BoardingPoints, Users) deve envolver suas rotas com ele. Continua sendo reforço de UX, não fonte de verdade — o backend já bloqueia com `403` independente disso (confirmado testando: `EMPLOYEE` batendo direto na API sem passar pela UI recebe `403` do `RolesGuard`).
- **`EmptyState`** (`components/feedback/EmptyState.tsx`, novo, compartilhado) e **`shadcn table`/`skeleton`** entraram nessa feature — primeiro módulo com listagem de verdade (loading via skeleton, vazio via `EmptyState`, erro `404` de `GET /:id` tratado com `isAxiosError(error) && error.response?.status === 404`, padrão a repetir nos próximos módulos).

## Arquitetura: por domínio (`features/`), não por tipo

Decisão registrada no plano de arquitetura inicial: `features/{domínio}/` (ex.: `features/auth/`, `features/excursions/`) concentra `api/`, `components/`, `hooks/`, `types/`, `pages/` daquele domínio. Camada compartilhada (`components/ui`, `components/layout`, `services/http`, `store`, `lib`) fica enxuta, só pro que é genérico de verdade — nada de regra de negócio de uma entidade específica aí. Motivo: o backend já tem 11 entidades, estrutura por tipo (`pages/`, `components/`, `services/` genéricos crescendo sem fim) não escala de forma legível nesse volume.

```
src/
  app/            # bootstrap: App.tsx, providers.tsx (QueryClient+Router), router.tsx (árvore de rotas)
  features/       # 1 pasta por domínio
    auth/
    dashboard/
    events/       # api, types, validations, hooks, pages — molde pros próximos módulos
  components/
    ui/           # shadcn/ui — Button, Input, Label, Card, DropdownMenu, Table, Skeleton (mais entram sob demanda via `pnpm dlx shadcn add`)
    layout/       # AppLayout (Sidebar+Header+Outlet), AuthLayout, Sidebar, Header, PageTitle
    feedback/     # EmptyState (mais entram conforme necessário — Loading, ConfirmDialog, ErrorBoundary)
  routes/         # PrivateRoute, PublicRoute, AdminRoute
  services/http/  # client.ts (instância axios) + interceptors.ts (token + refresh-and-retry)
  store/          # authStore.ts (zustand) — só estado de sessão, nunca estado de servidor
  lib/            # queryClient.ts, jwt.ts (decode), utils.ts (cn())
  config/         # env.ts
  constants/      # navigation.ts (itens da Sidebar — label/href/ícone/grupo/adminOnly/implemented)
  pages/          # páginas sem domínio (NotFoundPage)
  styles/         # globals.css (Tailwind + CSS vars do shadcn)
```

`Supplier`, `Expense` e `Organization` **não** têm feature própria — decisão explícita do usuário: `Supplier` aparece só como `Select` embutido no form de `VehicleBooking`, `Expense` como lista embutida nos detalhes de `Excursion`/`VehicleBooking`, `Organization` fora do fluxo operacional (criação é manual, fora do dia a dia).

## Autenticação

- **Tokens**: `accessToken` (JWT, 15min) só em memória (`authStore`, nunca em `localStorage`) — decodificado no client via `lib/jwt.ts` (`decodeJwt`, base64 puro, sem checar assinatura — validação de verdade é sempre no backend). `refreshToken` (opaco, 24h) em `localStorage`, sobrevive a F5.
- **Por que não cookie `httpOnly`**: o CORS do backend está com `credentials: false` hoje — não dá pra usar cookie sem mudar isso lá também. Documentado como decisão consciente de MVP, não definitivo.
- **Bootstrap de sessão** (`features/auth/hooks/useInitAuth.ts`): ao carregar a app, se existir `refreshToken` salvo, troca por um `accessToken` novo antes de renderizar rotas privadas (`App.tsx` mostra "Carregando..." enquanto isso resolve). Sem `refreshToken`, segue direto pro estado deslogado.
- **Interceptor** (`services/http/interceptors.ts`): injeta `Authorization: Bearer` em toda requisição; em `401` (fora das rotas `/auth/*`), dispara `POST /auth/refresh` **uma vez só por rajada** — requisições concorrentes reaproveitam a mesma Promise de refresh em vez de disparar N chamadas — e reexecuta a requisição original. Se o refresh falhar, limpa a sessão (`authStore.clear()`), o próximo `PrivateRoute` redireciona pro login.
- **`useAuth()`** (`features/auth/hooks/useAuth.ts`): `user` (payload decodificado do JWT — só tem `sub`/`organizationId`/`role`, **não tem nome nem e-mail**, ver limitação abaixo), `isAuthenticated`, `login()`, `logout()`, `hasRole()`.
- **Limitação conhecida do backend**: não existe endpoint `GET /auth/me` nem qualquer rota que devolva os dados do usuário logado além do que já está no JWT. `GET /users/:id` existe mas é `ADM`-only — um `EMPLOYEE` não consegue buscar os próprios dados por ali. Enquanto isso não for resolvido no backend, a `Profile` page e o nome no header ficam limitados ao que o token já carrega (`role`, `organizationId`, `sub`).

## shadcn/ui

- `components.json` configurado (`style: default`, `baseColor: slate`, `cssVariables: true`). Adicionar componente novo: `pnpm dlx shadcn@latest add {nome}` — copia o código pro repo (não é dependência de pacote), já sai formatado certo pro `cn()`/CSS vars daqui.
- **Pegadinha já resolvida**: o CLI do shadcn lê o `tsconfig.json` da raiz do app pra resolver o alias `@/*` — como esse projeto usa `tsconfig.json` só com `references` (padrão do Vite pra separar config de app/node), o CLI não achava o `paths` e criava uma pasta `@/` literal em vez de resolver pra `src/`. Corrigido duplicando `compilerOptions.paths` também no `tsconfig.json` raiz (além do `tsconfig.app.json`, que é o que realmente vale pra compilação). Se isso voltar a acontecer depois de mexer no tsconfig, é essa a causa.

## Convenções

Mesmo padrão de commit/branch do backend: 1 branch por feature/módulo, commits em português, sem trailer de co-autoria, usuário testa antes do push. Nomenclatura de arquivo: PascalCase pra componentes/páginas, camelCase pra hooks/services/utils. Ver o plano de arquitetura completo (rotas, bibliotecas avaliadas, padrão visual) na memória do projeto se precisar do racional completo por trás de cada escolha.
