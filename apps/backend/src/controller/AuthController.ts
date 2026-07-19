import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { LoginService } from 'src/service/LoginService';
import { LoginDTO } from 'src/shared/dtos/LoginDTO';

@Controller('/auth')
export class AuthController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  login(
    @Body() { email, password }: LoginDTO,
  ): Promise<{ accessToken: string }> {
    return this.loginService.execute({ email, password });
  }
}
