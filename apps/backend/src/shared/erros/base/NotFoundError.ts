import { HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class NotFoundError extends NotFoundException {
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  declare public statusCode: number;

  @ApiProperty({ type: () => String })
  declare public message: string;

  @ApiProperty({ type: () => String })
  declare public error: string;

  constructor(message: string, error: string) {
    super(message, error);
  }
}
