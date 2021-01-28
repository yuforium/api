import { Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiHeader, ApiProduces } from '@nestjs/swagger';
import { Request } from 'express';
import * as psl from 'psl';

@ApiTags('app', 'service')
@Controller()
export class AppController 
{
  constructor (private readonly appService: AppService, config: ConfigService) {

  }

  @ApiProduces("application/ld+json; profile=\"https://www.w3.org/ns/activitystreams\"", "application/activity+json")
  @Get()
  public getService(@Req() request: Request) {
    return this.appService.get(this.appService.getDomain(request.hostname));
  }

  @Get('inbox') 
  public readInbox(@Req() request: Request) {
    const domain = this.appService.getDomain(request.hostname);

  }

  @Post('inbox') 
  public writeInbox(@Req() request: Request) {

  }

  @Get('outbox')
  public readOutbox(@Req() request: Request) {

  }

  @Post('outbox')
  public writeOutbox(@Req() request: Request) {
    
  }

  @Post('sharedInbox')
  public writeSharedInbox(@Req() request: Request) {

  }

  @Get('sharedInbox')
  public readSharedInbox(@Req() request: Request) {

  }
}
