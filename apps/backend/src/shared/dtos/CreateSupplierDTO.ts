import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDTO {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  cnpj!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;
}
