import { Body, Controller, Get, HttpCode, HttpStatus, Logger, NotImplementedException, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivityService } from '../../../modules/activity/services/activity.service';
import { Request } from 'express';

@ApiTags('forum')
@Controller('forums/:pathId/inbox')
export class ForumInboxController {
  protected logger = new Logger(ForumInboxController.name);

  constructor(protected readonly activityService: ActivityService) {}

  @ApiOperation({operationId: 'getForumInbox'})
  @Get()
  public async getForumInbox() {
    throw new NotImplementedException();
  }

  @ApiOperation({operationId: 'postForumInbox'})
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  public async postForumInbox(
    @Req() request: Request,
    @Body() activity: any
  ) {
    this.logger.debug(`Received "${activity.type}" activity from ${request.connection.remoteAddress}`);
    const receipt = await this.activityService.process(activity);

    return {
      status: 'accepted',
      message: 'The activity was queued for processing.',
      receipt
    };
  }
}
