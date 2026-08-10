import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Payment } from '@prisma/client';
import { PaginatedPayments, Payments } from 'src/domain/PaymentRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreatePaymentService } from 'src/service/payment/CreatePaymentService';
import { GetPaymentService } from 'src/service/payment/GetPaymentService';
import { ListPaymentService } from 'src/service/payment/ListPaymentService';
import { ListPaginatedPaymentService } from 'src/service/payment/ListPaginatedPaymentService';
import { CreatePaymentDTO } from 'src/shared/dtos/CreatePaymentDTO';
import { ListPaginatedPaymentDTO } from 'src/shared/dtos/ListPaginatedPaymentDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(
    private readonly createPaymentService: CreatePaymentService,
    private readonly listPaymentService: ListPaymentService,
    private readonly listPaginatedPaymentService: ListPaginatedPaymentService,
    private readonly getPaymentService: GetPaymentService,
  ) {}

  @Post()
  create(
    @Body() { reservationId, type, value, method }: CreatePaymentDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Payment> {
    return this.createPaymentService.execute({
      organizationId: currentUser.organizationId,
      userId: currentUser.sub,
      reservationId,
      type,
      value,
      method,
    });
  }

  @Get()
  list(@CurrentUser() currentUser: JwtPayload): Promise<Payments[]> {
    return this.listPaymentService.execute({
      organizationId: currentUser.organizationId,
      userId: currentUser.sub,
      role: currentUser.role,
    });
  }

  @Get('paginated')
  listPaginated(
    @Query() { query, page, limit }: ListPaginatedPaymentDTO,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<PaginatedPayments> {
    return this.listPaginatedPaymentService.execute({
      organizationId: currentUser.organizationId,
      userId: currentUser.sub,
      role: currentUser.role,
      query,
      page,
      limit,
    });
  }

  @Get(':id')
  get(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<Payment> {
    return this.getPaymentService.execute({
      organizationId: currentUser.organizationId,
      userId: currentUser.sub,
      role: currentUser.role,
      id,
    });
  }
}
