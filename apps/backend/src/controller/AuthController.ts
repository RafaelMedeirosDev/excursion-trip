import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginService } from 'src/service/LoginService';
import { LoginDTO } from 'src/shared/dtos/LoginDTO';

@Controller('/auth')
export class AuthController {
  constructor(private readonly loginService: LoginService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() { email, password }: LoginDTO,
  ): Promise<{ accessToken: string }> {
    return this.loginService.execute({ email, password });
  }
}
