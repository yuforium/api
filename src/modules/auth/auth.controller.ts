import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { Request } from 'express';
import { UserDocument } from '../user/schemas/user.schema';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(protected authService: AuthService) { }

  @ApiBody({type: LoginDto})
  @ApiOperation({operationId: 'login'})
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Body() body: LoginDto) {
    return {...await this.authService.login(req.user as UserDocument)};
  }

  @ApiBearerAuth()
  @ApiOperation({operationId: 'profile'})
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async me(@Req() req: Request) {
    return (req.user as any).actor;
  }
}