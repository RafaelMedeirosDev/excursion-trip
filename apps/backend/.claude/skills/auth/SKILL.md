---
name: auth
description: Configura autenticacao JWT (login, guards, strategy, decorators) e o padrao para proteger rotas com @UseGuards/@Roles/@CurrentUser. Use ao implementar login ou ao proteger um Controller/rota existente.
---

# Skill: Auth (JWT)

Duas partes: (1) o setup de autenticacao em si — feito **uma unica vez** (login, JwtStrategy, Guards, decorators); (2) o padrao para **proteger uma rota**, que se repete em todo Controller que precisar de autenticacao — igual as demais camadas, mas aplicado por cima de um Controller ja existente.

## Pre-requisito

Existe um model `User` no `schema.prisma` com `email` (unico globalmente — nao por organizacao, senao o login fica ambiguo), `password` (guarda o hash, feito com `bcrypt`) e `role` usando o enum `Role` (`ADM`/`EMPLOYEE`), e existe `UserRepository` em `domain` (skill `domain`) com `findByEmail({ email })` (busca global, sem `organizationId`). Se isso ainda nao existir, sinalize a dependencia em vez de criar um stub. Isso ja existe no projeto (implementado junto com a feature de login) — nao recriar.

## Parte 1 — Setup (uma unica vez)

### Estrutura de pastas

```
src/
  strategies/JwtStrategy.ts
  guards/JwtAuthGuard.ts
  guards/RolesGuard.ts
  decorators/Roles.ts
  decorators/CurrentUser.ts
  service/LoginService.ts
  controller/AuthController.ts
  shared/dtos/LoginDTO.ts
  shared/erros/cases/InvalidCredentials.ts
```

### JwtStrategy (`src/strategies/JwtStrategy.ts`)

```ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  organizationId: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload; // vira `request.user`
  }
}
```

### JwtAuthGuard (`src/guards/JwtAuthGuard.ts`)

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### Roles decorator + RolesGuard

```ts
// src/decorators/Roles.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

```ts
// src/guards/RolesGuard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from 'src/decorators/Roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### CurrentUser decorator (`src/decorators/CurrentUser.ts`)

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/strategies/JwtStrategy';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### Login (DTO + Erro + Service + Controller)

DTO — segue a skill `dto`:

```ts
// src/shared/dtos/LoginDTO.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDTO {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;
}
```

Erro — segue a skill `erros`, reaproveita o base `UnauthorizedError` se ja existir (categoria `UnauthorizedError` / `UnauthorizedException` / `HttpStatus.UNAUTHORIZED`):

```ts
// src/shared/erros/cases/InvalidCredentials.ts
import { UnauthorizedError } from '../base/UnauthorizedError';

const message = 'Invalid email or password.' as const;
const error = 'invalid_credentials' as const;

export class InvalidCredentials extends UnauthorizedError {
  constructor() {
    super(message, error);
  }
}
```

Service — segue a skill `service` (um metodo `execute`, injeta Repository abstrato de `domain`):

```ts
// src/service/LoginService.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/domain/UserRepository';
import { InvalidCredentials } from 'src/shared/erros/cases/InvalidCredentials';

interface Request {
  email: string;
  password: string;
}

interface Response {
  accessToken: string;
}

@Injectable()
export class LoginService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ email, password }: Request): Promise<Response> {
    const user = await this.userRepository.findByEmail({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new InvalidCredentials();
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      organizationId: user.organizationId,
      role: user.role,
    });

    return { accessToken };
  }
}
```

Controller — segue a skill `controller` (fino, so delega):

```ts
// src/controller/AuthController.ts
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginService } from 'src/service/LoginService';
import { LoginDTO } from 'src/shared/dtos/LoginDTO';

@Controller('/auth')
export class AuthController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() { email, password }: LoginDTO,
  ): Promise<{ accessToken: string }> {
    return this.loginService.execute({ email, password });
  }
}
```

`@HttpCode(HttpStatus.OK)` é necessário porque `@Post()` retorna `201` por padrão no Nest — login não cria um recurso, então o correto é `200`.

### Registro em `app.module.ts`

Nao existe skill `module` — esse registro e feito inline, no mesmo `app.module.ts` que ja concentra tudo:

```ts
imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  PassportModule,
  JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '1d' },
  }),
],
controllers: [
  // ...
  AuthController,
],
providers: [
  // ...
  JwtStrategy,
  JwtAuthGuard,
  RolesGuard,
  LoginService,
  {
    provide: UserRepository,
    useClass: PrismaUserRepository,
  },
],
```

`JwtAuthGuard`/`RolesGuard` entram em `providers` porque `RolesGuard` injeta `Reflector` (fornecido pelo Nest) — nao precisam ser globais (`APP_GUARD`), sao aplicados explicitamente por rota (ver Parte 2).

## Parte 2 — Protegendo uma rota (repetido em cada Controller)

Nenhuma rota e protegida por padrao — a protecao e sempre explicita, por decorator, no Controller ou no metodo (mesma filosofia da skill `tools`: nada de magia automatica/registro implicito).

```ts
import { UseGuards, Post, Body, Controller } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { Roles } from 'src/decorators/Roles';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/excursions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExcursionController {
  @Post()
  @Roles(Role.ADMIN, Role.ORGANIZER)
  create(
    @Body() { /* campos de CreateExcursionDTO */ }: CreateExcursionDTO,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.createExcursionService.execute({
      /* campos */,
      organizationId: user.organizationId,
    });
  }
}
```

- `@UseGuards(JwtAuthGuard, RolesGuard)` no Controller protege todos os metodos; coloque so num metodo especifico se nem toda rota do Controller precisar de auth.
- `@Roles(...)` e opcional — sem ele, `RolesGuard` libera qualquer usuario autenticado (`requiredRoles` vazio retorna `true` em `canActivate`). So adicione quando a rota precisa restringir por role.
- `@CurrentUser()` extrai `{ sub, organizationId, role }` do token — use `organizationId` do token (nunca do body/query) para escopar toda query ao tenant do usuario logado.

## Escopo desta skill

Esta skill cuida da autenticacao (login, guards, strategy, decorators) e do padrao de protecao de rota. Ela assume que o model `User` e o `UserRepository` de `domain` ja existem — nao cria esses arquivos aqui (skill `domain`). Tambem nao cria o `Prisma{Entity}Repository` de `User` (skill `external`).

## Checklist ao aplicar

1. Confirmar que o model `User` existe no schema (email, passwordHash, role) e que `UserRepository` existe em `domain`
2. Se for a primeira vez que auth e implementado no projeto: criar `JwtStrategy`, `JwtAuthGuard`, `RolesGuard`, decorators `Roles`/`CurrentUser`, `LoginService`, `AuthController`, `LoginDTO`, erro `InvalidCredentials`, e registrar `JwtModule`/`PassportModule` + providers em `app.module.ts`
3. Se for so proteger uma rota existente: adicionar `@UseGuards(JwtAuthGuard, RolesGuard)` no Controller/metodo, `@Roles(...)` se precisar restringir por role, e usar `@CurrentUser()` para pegar o usuario logado (tipicamente para escopar por `organizationId`)
4. Rodar o build **e** subir a aplicacao para validar — erro de DI (guard/strategy sem provider) so aparece em runtime, nao no build
