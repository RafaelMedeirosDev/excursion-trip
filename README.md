# Gestão de Excursões

Monorepo (Turborepo + pnpm) para o sistema de gestão de excursões para eventos.

## Estrutura

- `apps/backend` — API NestJS + Prisma
- `apps/frontend` — reservado (framework a definir)
- `packages/config` — configuração compartilhada (tsconfig, eslint)
- `packages/shared` — tipos/enums compartilhados entre backend e frontend

## Desenvolvimento

```bash
pnpm install
pnpm dev
```
