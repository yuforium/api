import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService, JwtUser } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { Request } from 'express';
import { UserDocument } from '../user/schemas/user.schema';
import { plainToInstance } from 'class-transformer';
import { User } from '../../common/decorators/user.decorator';
import { JwtUserActorDto } from '../user/dto/user-actor.dto';
import { ActorDto } from '../object/dto/actor/actor.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(protected authService: AuthService) { }

  @ApiBody({type: LoginDto})
  @ApiOperation({operationId: 'login'})
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request) {
    return {...await this.authService.login(req.user as UserDocument)};
  }

  @ApiBearerAuth()
  @ApiOperation({operationId: 'profile'})
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async profile(@User() user: JwtUser): Promise<JwtUserActorDto> {
    return plainToInstance(ActorDto, user.actor);
  }
}
