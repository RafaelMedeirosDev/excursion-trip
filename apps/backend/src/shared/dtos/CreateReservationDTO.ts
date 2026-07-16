import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateReservationDTO {
  @IsNotEmpty()
  @IsUUID()
  customerId!: string;

  @IsNotEmpty()
  @IsUUID()
  vehicleBookingId!: string;

  @IsOptional()
  @IsUUID()
  boardingPointId?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  agreedValue!: number;
}
