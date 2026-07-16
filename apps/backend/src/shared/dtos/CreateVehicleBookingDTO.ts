import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateVehicleBookingDTO {
  @IsNotEmpty()
  @IsUUID()
  supplierId!: string;

  @IsNotEmpty()
  @IsUUID()
  excursionId!: string;

  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  vehicleType!: string;

  @IsOptional()
  @IsString()
  plate?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  capacity!: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  value!: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  returnTime?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  price!: number;
}
