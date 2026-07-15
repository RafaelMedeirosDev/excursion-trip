import { HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedError extends UnauthorizedException {
  @ApiProperty({ example: HttpStatus.UNAUTHORIZED })
  declare public statusCode: number;

  @ApiProperty({ type: () => String })
  declare public message: string;

  @ApiProperty({ type: () => String })
  declare public error: string;

  constructor(message: string, error: string) {
    super(message, error);
  }
}
