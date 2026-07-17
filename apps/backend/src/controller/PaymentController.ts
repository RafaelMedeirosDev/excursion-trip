import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Payment } from '@prisma/client';
import { Payments } from 'src/domain/PaymentRepository';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreatePaymentService } from 'src/service/CreatePaymentService';
import { ListPaymentService } from 'src/service/ListPaymentService';
import { CreatePaymentDTO } from 'src/shared/dtos/CreatePaymentDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(
    private readonly createPaymentService: CreatePaymentService,
    private readonly listPaymentService: ListPaymentService,
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
}
