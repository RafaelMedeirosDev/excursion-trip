import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
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
import { RefreshTokenRepository } from 'src/domain/RefreshTokenRepository';
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
import { PrismaRefreshTokenRepository } from 'src/external/repositories/remote/PrismaRefreshTokenRepository';
import { PrismaReservationRepository } from 'src/external/repositories/remote/PrismaReservationRepository';
import { PrismaSupplierRepository } from 'src/external/repositories/remote/PrismaSupplierRepository';
import { PrismaUserRepository } from 'src/external/repositories/remote/PrismaUserRepository';
import { PrismaVehicleBookingRepository } from 'src/external/repositories/remote/PrismaVehicleBookingRepository';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CancelReservationService } from 'src/service/reservation/CancelReservationService';
import { ConfirmReservationService } from 'src/service/reservation/ConfirmReservationService';
import { CreateBoardingPointService } from 'src/service/boarding-point/CreateBoardingPointService';
import { CreateCustomerService } from 'src/service/customer/CreateCustomerService';
import { CreateEventService } from 'src/service/event/CreateEventService';
import { CreateExcursionService } from 'src/service/excursion/CreateExcursionService';
import { CreateExpenseService } from 'src/service/expense/CreateExpenseService';
import { CreateOrganizationService } from 'src/service/organization/CreateOrganizationService';
import { CreatePaymentService } from 'src/service/payment/CreatePaymentService';
import { CreateReservationService } from 'src/service/reservation/CreateReservationService';
import { CreateSupplierService } from 'src/service/supplier/CreateSupplierService';
import { CreateUserService } from 'src/service/user/CreateUserService';
import { CreateVehicleBookingService } from 'src/service/vehicle-booking/CreateVehicleBookingService';
import { GetBoardingPointService } from 'src/service/boarding-point/GetBoardingPointService';
import { GetCustomerService } from 'src/service/customer/GetCustomerService';
import { GetEventService } from 'src/service/event/GetEventService';
import { GetExcursionService } from 'src/service/excursion/GetExcursionService';
import { GetExpenseService } from 'src/service/expense/GetExpenseService';
import { GetPaymentService } from 'src/service/payment/GetPaymentService';
import { GetReservationService } from 'src/service/reservation/GetReservationService';
import { GetSupplierService } from 'src/service/supplier/GetSupplierService';
import { GetUserService } from 'src/service/user/GetUserService';
import { GetVehicleBookingService } from 'src/service/vehicle-booking/GetVehicleBookingService';
import { ListBoardingPointService } from 'src/service/boarding-point/ListBoardingPointService';
import { ListCustomerService } from 'src/service/customer/ListCustomerService';
import { ListPaginatedCustomerService } from 'src/service/customer/ListPaginatedCustomerService';
import { ListEventService } from 'src/service/event/ListEventService';
import { ListPaginatedEventService } from 'src/service/event/ListPaginatedEventService';
import { ListExcursionService } from 'src/service/excursion/ListExcursionService';
import { ListPaginatedExcursionService } from 'src/service/excursion/ListPaginatedExcursionService';
import { ListExpenseService } from 'src/service/expense/ListExpenseService';
import { ListPaymentService } from 'src/service/payment/ListPaymentService';
import { ListPaginatedPaymentService } from 'src/service/payment/ListPaginatedPaymentService';
import { ListReservationService } from 'src/service/reservation/ListReservationService';
import { ListPaginatedReservationService } from 'src/service/reservation/ListPaginatedReservationService';
import { ListSupplierService } from 'src/service/supplier/ListSupplierService';
import { ListPaginatedSupplierService } from 'src/service/supplier/ListPaginatedSupplierService';
import { ListUserService } from 'src/service/user/ListUserService';
import { ListVehicleBookingService } from 'src/service/vehicle-booking/ListVehicleBookingService';
import { LoginService } from 'src/service/auth/LoginService';
import { LogoutService } from 'src/service/auth/LogoutService';
import { PendingReservationService } from 'src/service/reservation/PendingReservationService';
import { RefreshTokenService } from 'src/service/auth/RefreshTokenService';
import { UpdateExcursionStatusService } from 'src/service/excursion/UpdateExcursionStatusService';
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
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }]),
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
    ListUserService,
    GetUserService,
    LoginService,
    RefreshTokenService,
    LogoutService,
    CreateCustomerService,
    ListCustomerService,
    ListPaginatedCustomerService,
    GetCustomerService,
    CreateEventService,
    ListEventService,
    ListPaginatedEventService,
    GetEventService,
    CreateExcursionService,
    ListExcursionService,
    ListPaginatedExcursionService,
    GetExcursionService,
    UpdateExcursionStatusService,
    CreateSupplierService,
    ListSupplierService,
    ListPaginatedSupplierService,
    GetSupplierService,
    CreateVehicleBookingService,
    ListVehicleBookingService,
    GetVehicleBookingService,
    CreateExpenseService,
    ListExpenseService,
    GetExpenseService,
    CreateBoardingPointService,
    ListBoardingPointService,
    GetBoardingPointService,
    CreateReservationService,
    ListReservationService,
    ListPaginatedReservationService,
    GetReservationService,
    PendingReservationService,
    ConfirmReservationService,
    CancelReservationService,
    CreatePaymentService,
    ListPaymentService,
    ListPaginatedPaymentService,
    GetPaymentService,
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
    {
      provide: RefreshTokenRepository,
      useClass: PrismaRefreshTokenRepository,
    },
  ],
})
export class AppModule {}
