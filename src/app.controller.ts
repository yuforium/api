import { Body, Controller, Get, NotImplementedException, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiHeader, ApiProduces } from '@nestjs/swagger';
import { Request } from 'express';
import * as psl from 'psl';
import { AuthGuard } from '@nestjs/passport';
import { ServiceDomain } from './common/decorators/service-domain.decorator';
import { ForumCreateDto } from './common/dto/forum-create.dto';
import { ActivityStreams } from '@yuforium/activity-streams';
import { ObjectService } from './modules/object/object.service';
import { plainToClass } from 'class-transformer';

@ApiProduces("application/ld+json; profile=\"https://www.w3.org/ns/activitystreams\"", "application/activity+json")
@ApiTags('app')
@Controller()
export class AppController {
  constructor(
    protected readonly appService: AppService,
    // protected readonly objectService: ObjectService,
    config: ConfigService
  ) { }

  @Get()
  public async getService(@Req() request: Request, @ServiceDomain() serviceId: string) {
    return this.appService.get(serviceId);
  }

  /**
   * 
   * @param req
   * @param serviceId 
   * @param forumDto 
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('outbox')
  public async postOutbox(@Req() req: Request, @ServiceDomain() serviceId: string, @Body() forumDto: ForumCreateDto) {
    // @todo - determine if resource creation should be handled by the app outbox, user outbox, or individual resources (e.g. POST /forums)
    throw new NotImplementedException();
  }
}