import { IsNotEmpty, IsString } from 'class-validator';

export class CancelReservationDTO {
  @IsNotEmpty()
  @IsString()
  cancelReason!: string;
}
