import { Body, Controller, Get, NotImplementedException, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiHeader, ApiProduces } from '@nestjs/swagger';
import { Request } from 'express';
import * as psl from 'psl';
import { AuthGuard } from '@nestjs/passport';
import { ServiceId } from './common/decorators/service-id.decorator';
import { DomainDto } from './common/dto/domain.dto';
import { ForumCreateDto } from './common/dto/forum-create.dto';
import { ActivityStreams } from '@yuforium/activity-streams-validator';
import { ObjectService } from './modules/object/object.service';
import { plainToClass } from 'class-transformer';

@ApiProduces("application/ld+json; profile=\"https://www.w3.org/ns/activitystreams\"", "application/activity+json")
@ApiTags('app')
@Controller()
export class AppController {

  constructor(
    protected readonly appService: AppService,
    protected readonly objectService: ObjectService,
    config: ConfigService
  ) { }

  @Get()
  public async getService(@Req() request: Request, @ServiceId() serviceId: string) {
    return this.appService.get(serviceId);
  }

  // @Post()
  // public async createDomain(@Body() domainDto: DomainDto) {
  //   return domainDto;
  // }

  // @Patch()
  // public async patchDomain(@Body() domainDto) {

  // }

  // @Get('outbox')
  // public readOutbox(@Req() request: Request) {

  // }

  @UseGuards(AuthGuard('jwt'))
  @Post('outbox')
  public async postOutbox(@Req() req: Request, @ServiceId() serviceId: string, @Body() forumDto: ForumCreateDto) {
    // @todo - determine if resource creation should be handled by the app outbox, user outbox, or individual resources (e.g. POST /forums)
    throw new NotImplementedException();
    // if (forumDto instanceof ActivityStreams.Activity) {
    //   throw new NotImplementedException('Activity objects are not supported at this time.');
    // }
    // forumDto.attributedTo = req.user.actor.id;
    // forumDto.published = (new Date()).toISOString();
    // const activity = this.objectService.create(serviceId, `https://${serviceId}`, 'forum', forumDto, forumDto.id);
    // return plainToClass(ActivityStreams.Activity, activity, { excludeExtraneousValues: true});
  }
}