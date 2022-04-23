import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ActivityService } from '../activity/services/activity.service';

@Controller('user/:username/inbox')
export class UserInboxController {
  constructor(
    protected readonly activityService: ActivityService
  ) { }

  @ApiBearerAuth()
  @Get()
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  public async getInbox(@Req() req) {
    return true;
  }

  // this should send a 202 accepted since the result will be queued
  @ApiBearerAuth()
  @Post()
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  public async postInbox(@Req() req, @Body() body: any) {
    // @todo validate the activity

    console.log('activity received on the inbox', body);
    if (body.type === 'Create') {
      this.activityService.process(body);
    }
    return true;
  }
}
