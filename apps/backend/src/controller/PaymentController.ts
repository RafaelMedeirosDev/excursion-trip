import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Payment } from '@prisma/client';
import { Payments } from 'src/domain/PaymentRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreatePaymentService } from 'src/service/CreatePaymentService';
import { GetPaymentService } from 'src/service/GetPaymentService';
import { ListPaymentService } from 'src/service/ListPaymentService';
import { CreatePaymentDTO } from 'src/shared/dtos/CreatePaymentDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(
    private readonly createPaymentService: CreatePaymentService,
    private readonly listPaymentService: ListPaymentService,
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
