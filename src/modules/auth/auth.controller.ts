import { Controller, Body, Post } from '@nestjs/common';
import { LoginUserGTO, RegisterUserGTO } from './dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() data: RegisterUserGTO) {
    return this.authService.registerUser(data);
  }

  @Post('login')
  async login(@Body() data: LoginUserGTO) {
    return this.authService.loginUser(data);
  }
}
