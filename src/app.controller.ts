import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiHeader, ApiProduces } from '@nestjs/swagger';
import { Request } from 'express';
import * as psl from 'psl';
import { AuthGuard } from '@nestjs/passport';
import { ServiceId } from './common/decorators/service-id.decorator';
import { DomainDto } from './common/dto/domain.dto';

@ApiProduces("application/ld+json; profile=\"https://www.w3.org/ns/activitystreams\"", "application/activity+json")
@ApiTags('app')
@Controller()
export class AppController {

  constructor (private readonly appService: AppService, config: ConfigService) {}

  @Get()
  public async getService(@Req() request: Request, @ServiceId() serviceId: string) {
    return this.appService.get(serviceId);
  }

  @Post()
  public async createDomain(@Body() domainDto: DomainDto) {
    return domainDto;
  }

  @Patch()
  public async patchDomain(@Body() domainDto) {
    
  }

  @Get('outbox')
  public readOutbox(@Req() request: Request) {

  }

  @Post('outbox')
  public writeOutbox(@Req() request: Request) {

  }
}
