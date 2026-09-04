import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateSupplierDTO {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  cnpj?: string;

  // @IsOptional() ignora undefined (não mexe) e null (limpa o endereço)
  @IsOptional()
  @IsString()
  address?: string | null;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  phone?: string;
}
