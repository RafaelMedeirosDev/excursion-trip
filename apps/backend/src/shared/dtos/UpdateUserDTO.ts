import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateUserDTO {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
