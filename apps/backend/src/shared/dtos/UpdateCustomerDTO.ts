import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCustomerDTO {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  // @IsOptional() ignora undefined (não mexe) e null (limpa o e-mail);
  // string continua sendo validada como e-mail de verdade
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  cpf?: string;
}
