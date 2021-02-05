import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(protected authService: AuthService) { }

	@UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({type: LoginDto})
  async login(@Req() req, @Body() body: {username: string, password: string}) {
    return {...await this.authService.login(req.user)};
  }

  @UseGuards(JwtAuthGuard)
  @Get('whoami')
  async me(@Req() req) {
    return req.user;
  }
}