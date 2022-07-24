import { Body, Controller, Get, HttpCode, HttpStatus, Logger, NotImplementedException, Param, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceId } from 'src/common/decorators/service-id.decorator';
import { ActivityService } from 'src/modules/activity/services/activity.service';
import { ForumParams } from '../dto/forum-params.dto';

@ApiTags('forum')
@Controller('forum/:pathId/inbox')
export class ForumInboxController {
  protected logger = new Logger(ForumInboxController.name);

  constructor(protected readonly activityService: ActivityService) {}

  @ApiOperation({operationId: 'getForumInbox'})
  @Get()
  public async getForumInbox(@ServiceId() serviceId: string, @Param() params: ForumParams) {
    throw new NotImplementedException();
  }


  @ApiOperation({operationId: 'postForumInbox'})
  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  public async postForumInbox(
    @Req() request,
    @Body() activity: any,
    @Param() params: ForumParams
  ) {
    this.logger.debug(`Received "${activity.type}" activity from ${request.connection.remoteAddress}`);
    const receipt = this.activityService.process(activity);
    return {
      status: 'accepted',
      message: 'The activity was queued for processing.',
      receipt
    }
  }
}