import { ExcursionStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListExcursionDTO {
  @IsOptional()
  @IsEnum(ExcursionStatus)
  status?: ExcursionStatus;
}
