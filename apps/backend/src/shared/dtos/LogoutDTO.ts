import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDTO {
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
}
