import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiHeader, ApiProduces } from '@nestjs/swagger';
import { Request } from 'express';
import * as psl from 'psl';
import { AuthGuard } from '@nestjs/passport';
import { ServiceId } from './common/decorators/service-id.decorator';

@ApiTags('app', 'service')
@Controller()
export class AppController 
{
  constructor (private readonly appService: AppService, config: ConfigService) {}

  // @UseGuards(AuthGuard('local'))
  // @Post('auth/login')
  // async login(@Req() req, @Body() body: {username: string, password: string}) {
  //   return req.user;
  // }

  @ApiProduces("application/ld+json; profile=\"https://www.w3.org/ns/activitystreams\"", "application/activity+json")
  @Get()
  public async getService(@Req() request: Request, @ServiceId() serviceId: string) {
    return this.appService.get(serviceId);
  }

  @Get('outbox')
  public readOutbox(@Req() request: Request) {

  }

  @Post('outbox')
  public writeOutbox(@Req() request: Request) {

  }
}
