import {
  IsInt,
  IsNotEmpty,
  IsNumber,
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
  @IsNumber()
  @Min(0)
  value!: number;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  returnTime?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price!: number;
}
