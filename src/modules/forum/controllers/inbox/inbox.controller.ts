import { Controller, Get, Req, Param, Post, Body } from '@nestjs/common';
import { Follow } from '@yuforium/activity-streams-validator';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ActivityService } from 'src/modules/activity/services/activity.service';
import { ForumParams } from '../../dto/forum-params.dto';

@Controller('forum/:pathId/inbox')
export class InboxController {

  constructor(protected readonly activityService: ActivityService) { }
  @Get()
  public getInbox(@Req() request, @Param() params: ForumParams) {
    // get all messages from this forum, used by clients
  }

  @Post()
  public async postInbox(@Req() request, @Param() params: ForumParams, @Body() data: any) {
    const activity = plainToInstance(Follow, data);

    // steps
    // 1. validate activity
    // 2. dump into queue
    // 3. determine what to do next
    //   a. if auto follow is enabled, send back new accept activity - accept or reject
    //   b. if auto follow is disabled, leave it to the client to decide
    console.log(activity);
    const errs = await validate(activity);
    console.log("errors are", errs);

    // server to server federation
  }
}
