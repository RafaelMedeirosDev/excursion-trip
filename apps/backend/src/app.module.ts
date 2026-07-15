import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from 'src/controller/AuthController';
import { CustomerController } from 'src/controller/CustomerController';
import { OrganizationController } from 'src/controller/OrganizationController';
import { UserController } from 'src/controller/UserController';
import { CustomerRepository } from 'src/domain/CustomerRepository';
import { OrganizationRepository } from 'src/domain/OrganizationRepository';
import { UserRepository } from 'src/domain/UserRepository';
import { PrismaCustomerRepository } from 'src/external/repositories/remote/PrismaCustomerRepository';
import { PrismaOrganizationRepository } from 'src/external/repositories/remote/PrismaOrganizationRepository';
import { PrismaRemoteRepository } from 'src/external/repositories/remote/PrismaRemoteRepository';
import { PrismaUserRepository } from 'src/external/repositories/remote/PrismaUserRepository';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateCustomerService } from 'src/service/CreateCustomerService';
import { CreateOrganizationService } from 'src/service/CreateOrganizationService';
import { CreateUserService } from 'src/service/CreateUserService';
import { LoginService } from 'src/service/LoginService';
import { JwtStrategy } from 'src/strategies/JwtStrategy';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN ?? '1d' },
    }),
  ],
  controllers: [
    AppController,
    OrganizationController,
    UserController,
    AuthController,
    CustomerController,
  ],
  providers: [
    AppService,
    PrismaRemoteRepository,
    CreateOrganizationService,
    CreateUserService,
    LoginService,
    CreateCustomerService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: OrganizationRepository,
      useClass: PrismaOrganizationRepository,
    },
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: CustomerRepository,
      useClass: PrismaCustomerRepository,
    },
  ],
})
export class AppModule {}
