import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from 'src/controller/AuthController';
import { BoardingPointController } from 'src/controller/BoardingPointController';
import { CustomerController } from 'src/controller/CustomerController';
import { EventController } from 'src/controller/EventController';
import { ExcursionController } from 'src/controller/ExcursionController';
import { ExpenseController } from 'src/controller/ExpenseController';
import { OrganizationController } from 'src/controller/OrganizationController';
import { PaymentController } from 'src/controller/PaymentController';
import { ReservationController } from 'src/controller/ReservationController';
import { SupplierController } from 'src/controller/SupplierController';
import { UserController } from 'src/controller/UserController';
import { VehicleBookingController } from 'src/controller/VehicleBookingController';
import { BoardingPointRepository } from 'src/domain/BoardingPointRepository';
import { CustomerRepository } from 'src/domain/CustomerRepository';
import { EventRepository } from 'src/domain/EventRepository';
import { ExcursionRepository } from 'src/domain/ExcursionRepository';
import { ExpenseRepository } from 'src/domain/ExpenseRepository';
import { OrganizationRepository } from 'src/domain/OrganizationRepository';
import { PaymentRepository } from 'src/domain/PaymentRepository';
import { ReservationRepository } from 'src/domain/ReservationRepository';
import { SupplierRepository } from 'src/domain/SupplierRepository';
import { UserRepository } from 'src/domain/UserRepository';
import { VehicleBookingRepository } from 'src/domain/VehicleBookingRepository';
import { PrismaBoardingPointRepository } from 'src/external/repositories/remote/PrismaBoardingPointRepository';
import { PrismaCustomerRepository } from 'src/external/repositories/remote/PrismaCustomerRepository';
import { PrismaEventRepository } from 'src/external/repositories/remote/PrismaEventRepository';
import { PrismaExcursionRepository } from 'src/external/repositories/remote/PrismaExcursionRepository';
import { PrismaExpenseRepository } from 'src/external/repositories/remote/PrismaExpenseRepository';
import { PrismaOrganizationRepository } from 'src/external/repositories/remote/PrismaOrganizationRepository';
import { PrismaPaymentRepository } from 'src/external/repositories/remote/PrismaPaymentRepository';
import { PrismaRemoteRepository } from 'src/external/repositories/remote/PrismaRemoteRepository';
import { PrismaReservationRepository } from 'src/external/repositories/remote/PrismaReservationRepository';
import { PrismaSupplierRepository } from 'src/external/repositories/remote/PrismaSupplierRepository';
import { PrismaUserRepository } from 'src/external/repositories/remote/PrismaUserRepository';
import { PrismaVehicleBookingRepository } from 'src/external/repositories/remote/PrismaVehicleBookingRepository';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreateBoardingPointService } from 'src/service/CreateBoardingPointService';
import { CreateCustomerService } from 'src/service/CreateCustomerService';
import { CreateEventService } from 'src/service/CreateEventService';
import { CreateExcursionService } from 'src/service/CreateExcursionService';
import { CreateExpenseService } from 'src/service/CreateExpenseService';
import { CreateOrganizationService } from 'src/service/CreateOrganizationService';
import { CreatePaymentService } from 'src/service/CreatePaymentService';
import { CreateReservationService } from 'src/service/CreateReservationService';
import { CreateSupplierService } from 'src/service/CreateSupplierService';
import { CreateUserService } from 'src/service/CreateUserService';
import { CreateVehicleBookingService } from 'src/service/CreateVehicleBookingService';
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
    EventController,
    ExcursionController,
    SupplierController,
    VehicleBookingController,
    ExpenseController,
    BoardingPointController,
    ReservationController,
    PaymentController,
  ],
  providers: [
    AppService,
    PrismaRemoteRepository,
    CreateOrganizationService,
    CreateUserService,
    LoginService,
    CreateCustomerService,
    CreateEventService,
    CreateExcursionService,
    CreateSupplierService,
    CreateVehicleBookingService,
    CreateExpenseService,
    CreateBoardingPointService,
    CreateReservationService,
    CreatePaymentService,
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
    {
      provide: EventRepository,
      useClass: PrismaEventRepository,
    },
    {
      provide: ExcursionRepository,
      useClass: PrismaExcursionRepository,
    },
    {
      provide: SupplierRepository,
      useClass: PrismaSupplierRepository,
    },
    {
      provide: VehicleBookingRepository,
      useClass: PrismaVehicleBookingRepository,
    },
    {
      provide: ExpenseRepository,
      useClass: PrismaExpenseRepository,
    },
    {
      provide: BoardingPointRepository,
      useClass: PrismaBoardingPointRepository,
    },
    {
      provide: ReservationRepository,
      useClass: PrismaReservationRepository,
    },
    {
      provide: PaymentRepository,
      useClass: PrismaPaymentRepository,
    },
  ],
})
export class AppModule {}
