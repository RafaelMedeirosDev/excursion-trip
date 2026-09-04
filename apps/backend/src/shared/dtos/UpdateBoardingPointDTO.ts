import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// vehicleBookingId não existe aqui de propósito: com forbidNonWhitelisted
// global, tentar mandá-lo devolve 400 em vez de ser descartado em silêncio
export class UpdateBoardingPointDTO {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  address?: string;

  // @IsOptional() ignora undefined (não mexe) e null (limpa o horário)
  @IsOptional()
  @IsString()
  time?: string | null;
}
