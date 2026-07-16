import { ExpensesCategory } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateExpenseDTO {
  @IsNotEmpty()
  @IsUUID()
  excursionId!: string;

  @IsOptional()
  @IsUUID()
  vehicleBookingId?: string;

  @IsNotEmpty()
  @IsEnum(ExpensesCategory)
  category!: ExpensesCategory;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  value!: number;

  @IsNotEmpty()
  @IsString()
  description!: string;
}
