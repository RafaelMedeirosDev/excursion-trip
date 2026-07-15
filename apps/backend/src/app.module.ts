import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OrganizationController } from 'src/controller/OrganizationController';
import { OrganizationRepository } from 'src/domain/OrganizationRepository';
import { PrismaOrganizationRepository } from 'src/external/repositories/remote/PrismaOrganizationRepository';
import { PrismaRemoteRepository } from 'src/external/repositories/remote/PrismaRemoteRepository';
import { CreateOrganizationService } from 'src/service/CreateOrganizationService';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, OrganizationController],
  providers: [
    AppService,
    PrismaRemoteRepository,
    CreateOrganizationService,
    {
      provide: OrganizationRepository,
      useClass: PrismaOrganizationRepository,
    },
  ],
})
export class AppModule {}
