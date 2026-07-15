import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateEventDTO {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsNotEmpty()
  @IsString()
  city!: string;

  @IsNotEmpty()
  @IsDateString()
  startDate!: string;

  @IsNotEmpty()
  @IsDateString()
  endDate!: string;

  @IsNotEmpty()
  @IsString()
  startTime!: string;

  @IsNotEmpty()
  @IsString()
  endTime!: string;
}
