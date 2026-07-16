import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBoardingPointDTO {
  @IsNotEmpty()
  @IsUUID()
  vehicleBookingId!: string;

  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsOptional()
  @IsString()
  time?: string;
}
