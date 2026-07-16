import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Payment } from '@prisma/client';
import { CurrentUser } from 'src/decorators/CurrentUser';
import { JwtAuthGuard } from 'src/guards/JwtAuthGuard';
import { RolesGuard } from 'src/guards/RolesGuard';
import { CreatePaymentService } from 'src/service/CreatePaymentService';
import { CreatePaymentDTO } from 'src/shared/dtos/CreatePaymentDTO';
import { JwtPayload } from 'src/strategies/JwtStrategy';

@Controller('/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(private readonly createPaymentService: CreatePaymentService) {}

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
}
