import { PaymentMethod, PaymentType } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreatePaymentDTO {
  @IsNotEmpty()
  @IsUUID()
  reservationId!: string;

  @IsNotEmpty()
  @IsEnum(PaymentType)
  type!: PaymentType;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  value!: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}
