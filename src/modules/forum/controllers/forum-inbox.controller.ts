import { Body, Controller, Get, HttpCode, HttpStatus, Logger, NotImplementedException, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActivityService } from '../../../modules/activity/services/activity.service';
import { Request } from 'express';
import { ForumParams } from '../dto/forum-params.dto';

@ApiTags('forum')
@Controller('forums/:forumname/inbox')
export class ForumInboxController {
  protected logger = new Logger(ForumInboxController.name);

  constructor(protected readonly activityService: ActivityService) {}

  @ApiOperation({operationId: 'getForumInbox'})
  @Get()
  public async getForumInbox(
    @Param() params: ForumParams
  ) {
    this.logger.debug(`Received GET request for forum inbox ${params.forumname}`);
    throw new NotImplementedException();
  }

  @ApiOperation({operationId: 'postForumInbox'})
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  public async postForumInbox(
    @Req() request: Request,
    @Param() params: ForumParams,
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
