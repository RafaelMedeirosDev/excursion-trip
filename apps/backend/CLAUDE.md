# Backend — Gestão de Excursões

API NestJS + Prisma (PostgreSQL) para o sistema de gestão de excursões. Este arquivo descreve a arquitetura em camadas do backend. **A fonte de verdade detalhada de cada camada (convenções, templates, checklist) vive em `.claude/skills/{camada}/SKILL.md`** — este documento é só o mapa; consulte a skill antes de gerar código.

## Estado atual

- `prisma/schema.prisma` completo e migrado (`Organization`, `User`, `Supplier`, `Customer`, `Event`, `Excursion`, `VehicleBooking`, `BoardingPoint`, `Reservation`, `Payment`, `Expense` — ver `apps/backend/prisma/schema.prisma` para o modelo exato).
- **Entidades implementadas:** `Organization` (só `create`, `POST /organizations`, checagem de duplicidade de CNPJ) e `User` (só `create`, `POST /users`, senha com hash bcrypt, checagem de duplicidade de email/cpf por organização). Todas as outras ainda não têm Controller/Service/Domain/External — não implemente uma entidade especulativamente, só quando pedido.
- **Setup compartilhado já existe** (criado uma única vez, não recriar): `src/external/repositories/remote/PrismaRemoteRepository.ts` (wrapper do `PrismaClient`) e `src/shared/erros/base/AlreadyExistsError.ts` (`ConflictException`, reaproveitável por qualquer entidade que precise checar duplicidade). `@nestjs/config` e `@nestjs/swagger` (`^7`, não `^11` — o projeto está no Nest 10) já são dependências do projeto.
- Autenticação (JWT) ainda não foi implementada — sem login/guards ainda, mesmo o `User` já existindo. A skill `.claude/skills/auth` documenta o padrão (setup + como proteger uma rota); implementar quando pedido.
- **Nota de segurança conhecida:** `POST /users` retorna o model `User` completo, incluindo o hash da senha no campo `password` — decisão explícita do usuário pra seguir o padrão genérico das skills por enquanto (pode ser revisitado depois, ex.: omitir `password` da resposta).

## Arquitetura em camadas

Fluxo de uma requisição: `Controller → Service → Domain (contrato) ⟷ External (implementação)`. `Controller` nunca chama `Repository` direto — sempre passa por um `Service`. `Service` nunca importa Prisma direto — só o contrato abstrato de `domain`.

| Camada | Pasta | O que mora aqui | Skill |
|---|---|---|---|
| Controller | `src/controller/` | Endpoints HTTP, `{Entity}Controller.ts` | `.claude/skills/controller` |
| Domain | `src/domain/` | Contrato `{Entity}Repository` (classe abstrata) + tipos | `.claude/skills/domain` |
| Service | `src/service/` | Regra de negócio, um caso de uso por classe, `{Operation}{Entity}Service.ts` | `.claude/skills/service` |
| External | `src/external/repositories/{remote,local}/` | Implementação concreta do contrato de `domain` | `.claude/skills/external` |
| DTO | `src/shared/dtos/` | Validação de entrada (`class-validator`) | `.claude/skills/dto` |
| Erros | `src/shared/erros/{base,cases}/` | Erros de negócio tipados | `.claude/skills/erros` |
| Tools | `src/tools/` | Function-calling para IA (equivalente a Controller, mas para a IA) | `.claude/skills/tools` |
| Auth | `src/{strategies,guards,decorators}/` | Login, proteção de rota (`@UseGuards`/`@Roles`/`@CurrentUser`) | `.claude/skills/auth` |
| Validators | `src/validators/` | Validadores customizados usados pelos DTOs | — |

**Não existe módulo por entidade** (`{Entity}Module.ts`) nem pasta `module/`, e não há uma skill dedicada para isso. Ao terminar de criar Controller/Service/Domain/External/Tools de uma entidade, registre tudo diretamente em `src/app.module.ts`: adicione o Controller a `controllers`, os Services a `providers`, faça o binding `{ provide: {Entity}Repository, useClass: Prisma{Entity}Repository }`, e — se houver Tools — inclua-as em `providers` e no `useFactory` do provider `TOOLS`.

**Não existe `usecase/`** — o equivalente é `service/`.

## Convenções que atravessam todas as camadas

- Nomes de arquivo em **PascalCase**, sem kebab-case, sem sufixo com ponto (ex.: `ContactController.ts`, não `contact.controller.ts`).
- Imports usam caminho absoluto a partir de `src` (`'src/domain/ContactRepository'`), nunca relativo.
- Parâmetros de entrada são sempre desestruturados direto na assinatura (`{ campo1, campo2 }: Create`), nunca recebidos como objeto inteiro.
- Enums vêm sempre de `@prisma/client` (fonte de verdade é o `schema.prisma`) — nunca redeclare um enum à mão.
- Só implemente as operações (`create`/`list`/`findById`/`update`/`delete`) que foram de fato pedidas — não complete o CRUD especulativamente.

### `external/repositories/{remote,local}` — atenção ao significado

- **`remote/`** = implementação contra o Postgres via Prisma (`Prisma{Entity}Repository.ts`), injetando `PrismaRemoteRepository` (criado uma única vez, registrado direto em `app.module.ts`).
- **`local/`** = implementação local do mesmo contrato sem Prisma (in-memory, fixtures, cache).

## Fluxo para adicionar uma entidade nova

Ordem sugerida, aplicando a skill de cada camada:

1. `domain` — contrato `{Entity}Repository` + tipos
2. `external` — implementação Prisma (`remote/`) do contrato
3. `dto` — DTO de entrada da operação
4. `erros` — erro(s) de negócio, se a operação tiver alguma invariante
5. `service` — caso de uso, injeta o(s) `Repository` de `domain`
6. `controller` — endpoint HTTP, injeta o(s) `Service`
7. `tools` — só se a operação precisar ser exposta para a IA
8. Registrar tudo em `app.module.ts` (controllers, providers, binding `provide`/`useClass` — ver seção acima)
9. Rodar `pnpm --filter @excursion-trip/backend build` **e** subir a aplicação — erro de DI (`UnknownDependenciesException`) só aparece em runtime, não no build

## Comandos

```bash
pnpm --filter @excursion-trip/backend dev      # nest start --watch
pnpm --filter @excursion-trip/backend build
pnpm --filter @excursion-trip/backend lint
pnpm --filter @excursion-trip/backend exec prisma migrate dev   # nova migration após mudar o schema
```
