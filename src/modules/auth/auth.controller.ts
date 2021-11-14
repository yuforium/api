import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(protected authService: AuthService) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiBody({type: LoginDto})
  async login(@Req() req, @Body() body: LoginDto) {
    return {...await this.authService.login(req.user)};
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async me(@Req() req) {
    console.log(req.user);
    return req.user;
  }
}