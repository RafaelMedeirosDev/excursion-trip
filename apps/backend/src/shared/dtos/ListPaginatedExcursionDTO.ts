import { ExcursionStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListPaginatedExcursionDTO {
  @IsOptional()
  @IsEnum(ExcursionStatus)
  status?: ExcursionStatus;

  @IsOptional()
  @IsString()
  eventName?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
