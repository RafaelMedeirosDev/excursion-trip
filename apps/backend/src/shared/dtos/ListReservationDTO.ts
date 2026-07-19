import { ReservationStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListReservationDTO {
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
