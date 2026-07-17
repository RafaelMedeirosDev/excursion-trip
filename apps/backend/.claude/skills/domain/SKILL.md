---
name: domain
description: Gera o contrato de Repository (classe abstrata) e os tipos de uma entidade dentro de src/domain. Use ao definir como uma entidade e persistida, antes de implementar o repositorio concreto em external.
---

# Skill: Domain (Repository contract)

Define, para uma entidade, o contrato que qualquer implementacao de persistencia (Prisma, in-memory, etc.) precisa cumprir. Este arquivo nao tem implementacao — so tipos e uma classe abstrata. Quem implementa de fato vive em `external/repositories/*` (ver skill `external`).

## Convencoes

- Arquivo: `src/domain/{Entity}Repository.ts` — PascalCase, sem kebab-case, nome igual ao da classe exportada
- Os tipos de input de cada metodo (`Create`, `FindById`, `Update`, ...) sao interfaces simples, nomeadas pela operacao (sem prefixo da entidade — o namespace e o proprio arquivo)
- `{Entity}s` (plural) e o tipo "hidratado": a entidade base do Prisma (`@prisma/client`) com as relations incluidas (`& { relacao1; relacao2[] }`), OU com campos sensiveis excluidos (`Omit<{Entity}, 'campoSensivel'>`) quando a listagem nao deve expor tudo (ex.: senha). E usado em `findAll`/`findById`, que normalmente precisam de uma forma diferente do model puro de `create`
- **Este projeto e multi-tenant: toda entidade de negocio tem `organizationId`, e `findAll` sempre recebe `{ organizationId }` pra escopar a query** — nunca um `findAll()` sem parametro que devolveria dados de outras organizacoes. Essa e uma convencao mais forte que o template generico abaixo (que nao tem nocao de tenant) — sempre aplicar o escopo por organizacao em cima do template
- A classe `{Entity}Repository` e `abstract` — so declara assinaturas, sem corpo
- Parametro de entrada e sempre desestruturado direto na assinatura (`{ campo1, campo2 }: Create`), nunca recebido como objeto inteiro (`input: Create`)
- So declare os metodos que a feature realmente precisa agora — nao especule `update`/`delete` sem necessidade

## Template generico

```ts
import { {Entity} /*, Relation1, Relation2 */ } from '@prisma/client';

export interface Create {
  organizationId: string;
  // demais campos necessarios para criar a entidade
}

export type {Entity}s = {Entity} & {
  // relacoes incluidas, ex: relation1: Relation1; relation2: Relation2[];
  // OU Omit<{Entity}, 'campoSensivel'> quando a listagem exclui algum campo
};

export interface FindById {
  id: string;
}

export interface FindAll {
  organizationId: string;
}

export abstract class {Entity}Repository {
  abstract create({ /* campos de Create */ }: Create): Promise<{Entity}>;
  abstract findAll({ organizationId }: FindAll): Promise<{Entity}s[]>;
  abstract findById({ id }: FindById): Promise<{Entity}s | null>;
}
```

### Extensoes opcionais (so adicionar se o caso de uso existir)

```ts
export interface Update {
  id: string;
  // campos atualizaveis
}

// dentro da abstract class:
abstract update({ /* campos de Update */ }: Update): Promise<{Entity}>;
abstract delete({ id }: FindById): Promise<void>;
```

## Checklist ao aplicar

1. Confirmar a entidade e quais operacoes de persistencia sao necessarias agora
2. Confirmar quais relations precisam vir incluidas em `{Entity}s`, e se algum campo sensivel (ex.: senha) deve ser excluido da listagem
3. Criar `src/domain/{Entity}Repository.ts` seguindo o template — lembrando de escopar `findAll` por `organizationId`
4. A implementacao concreta (Prisma ou outra) e responsabilidade da skill `external` — nao implemente aqui
