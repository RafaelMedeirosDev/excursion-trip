import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

// eventId não existe aqui de propósito: trocar o evento da excursão criaria
// reservas duplicadas do mesmo passageiro no mesmo evento, sem erro visível.
// status/canceledAt/cancelReason também não: são de PATCH /excursions/:id/status,
// que valida a máquina de estados.
// Com forbidNonWhitelisted global, mandar qualquer um deles devolve 400 em vez
// de ser descartado em silêncio.
export class UpdateExcursionDTO {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @IsOptional()
  @IsDateString()
  returnDate?: string;
}
