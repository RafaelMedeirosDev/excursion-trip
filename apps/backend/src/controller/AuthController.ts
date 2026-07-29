import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { LoginService } from 'src/service/auth/LoginService';
import { LogoutService } from 'src/service/auth/LogoutService';
import { RefreshTokenService } from 'src/service/auth/RefreshTokenService';
import { LoginDTO } from 'src/shared/dtos/LoginDTO';
import { LogoutDTO } from 'src/shared/dtos/LogoutDTO';
import { RefreshTokenDTO } from 'src/shared/dtos/RefreshTokenDTO';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly loginService: LoginService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly logoutService: LogoutService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  login(
    @Body() { email, password }: LoginDTO,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.loginService.execute({ email, password });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  refresh(
    @Body() { refreshToken }: RefreshTokenDTO,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return this.refreshTokenService.execute({ refreshToken });
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Body() { refreshToken }: LogoutDTO): Promise<void> {
    return this.logoutService.execute({ refreshToken });
  }
}
