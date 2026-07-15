import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateExcursionDTO {
  @IsNotEmpty()
  @IsUUID()
  eventId!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsDateString()
  departureDate!: string;

  @IsNotEmpty()
  @IsDateString()
  returnDate!: string;
}
