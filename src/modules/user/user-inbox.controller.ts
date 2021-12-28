import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('user/:username/inbox')
export class UserInboxController {
  constructor() {}

  @ApiBearerAuth()
  @Get()
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  public async getInbox(@Req() req) {
    return true;
  }

  @ApiBearerAuth()
  @Post()
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  public async postInbox(@Req() req) {
    return true;
  }
}
