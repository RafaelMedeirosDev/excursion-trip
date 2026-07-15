import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrganizationDTO {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  cnpj?: string;
}
