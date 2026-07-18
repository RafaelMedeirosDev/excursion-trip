import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class InvalidStateError extends BadRequestException {
  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  declare public statusCode: number;

  @ApiProperty({ type: () => String })
  declare public message: string;

  @ApiProperty({ type: () => String })
  declare public error: string;

  constructor(message: string, error: string) {
    super(message, error);
  }
}
