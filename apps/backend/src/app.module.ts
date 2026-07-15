import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrganizationController } from 'src/controller/OrganizationController';
import { UserController } from 'src/controller/UserController';
import { OrganizationRepository } from 'src/domain/OrganizationRepository';
import { UserRepository } from 'src/domain/UserRepository';
import { PrismaOrganizationRepository } from 'src/external/repositories/remote/PrismaOrganizationRepository';
import { PrismaRemoteRepository } from 'src/external/repositories/remote/PrismaRemoteRepository';
import { PrismaUserRepository } from 'src/external/repositories/remote/PrismaUserRepository';
import { CreateOrganizationService } from 'src/service/CreateOrganizationService';
import { CreateUserService } from 'src/service/CreateUserService';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, OrganizationController, UserController],
  providers: [
    AppService,
    PrismaRemoteRepository,
    CreateOrganizationService,
    CreateUserService,
    {
      provide: OrganizationRepository,
      useClass: PrismaOrganizationRepository,
    },
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
})
export class AppModule {}
