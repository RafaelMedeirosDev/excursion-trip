import { ExcursionStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateExcursionStatusDTO {
  @IsNotEmpty()
  @IsEnum(ExcursionStatus)
  status!: ExcursionStatus;

  @IsOptional()
  @IsString()
  cancelReason?: string;
}
