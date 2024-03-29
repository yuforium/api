import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Note } from '@yuforium/activity-streams';
import { plainToClass } from 'class-transformer';
import { ServiceDomain } from '../../../common/decorators/service-domain.decorator';
import { ObjectService } from '../../../modules/object/object.service';
import { ActivityService } from '../../activity/services/activity.service';
import { Request } from 'express';
import { ObjectDocument } from '../../../modules/object/schema/object.schema';
import { InboxService } from '../../../modules/activity-pub/services/inbox.service';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';

@ApiTags('user')
@Controller('users/:username/inbox')
export class UserInboxController {
  protected logger = new Logger(UserInboxController.name);

  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    protected readonly inboxService: InboxService
  ) { }

  @ApiBearerAuth()
  @ApiOperation({operationId: 'getInbox'})
  @ApiParam({name: 'username', required: true, type: String, 'description': 'The username of the user to get the inbox for.'})
  @Get()
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  public async getInbox(@ServiceDomain() domain: string, @Param() params: any) {
    const queryParams = {to: `https://${domain}/user/${params.username}`};
    const content = await this.objectService.find(queryParams);
    const response = content.map((item: ObjectDocument) => plainToClass(Note, item, {excludeExtraneousValues: true}));

    return response;
  }

  // this should send a 202 accepted since the result will be queued
  @ApiBearerAuth() // @todo is this necessary? a token can be passed to authenticate the user but it's completely optional (could be used to bypass rate limiting)
  @ApiOperation({operationId: 'postInbox'})
  @ApiParam({name: 'username', required: true, type: String, 'description': 'The username of the user to get the inbox for.'})
  @Post()
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @HttpCode(HttpStatus.ACCEPTED)
  public async postInbox(
    @ServiceDomain() serviceId: string, @Req() req: Request, @Body() activity: any, @Param('username') username: string
  ) {
    // const signature = req.header('Signature');
    const targetUserId = `https://${serviceId}/user/${username}`;

    // if (typeof activity.object.to === 'string' && activity.object.to !== targetUserId) {
    //   throw new BadRequestException(`The activity is not intended for the user ${targetUserId}.`);
    // }
    // else if (Array.isArray(activity.object.to) && !activity.object.to.includes(targetUserId)) {
    //   throw new BadRequestException(`The activity is not intended for the user ${targetUserId}.`);
    // }

    this.logger.debug(`postInbox(): Received "${activity.type}" activity for ${targetUserId} from ${req.socket.remoteAddress}`);
    
    try {
      await this.inboxService.receive<ActivityDto>(activity, {requestSignature: {headers: req.headers, path: `/users/${username}/inbox`, method: 'post'}});
    }
    catch (e: any) {
      this.logger.error(`postInbox(): Activity "${activity.type}" for ${targetUserId} from ${req.socket.remoteAddress} was rejected: ${e.message}`);
      throw e;
    }

    this.logger.debug(`postInbox(): Activity "${activity.type}" for ${targetUserId} from ${req.socket.remoteAddress} was accepted`);
    
    return {
      'status': 'Accepted',
      'id': activity.id,
    };
    // const receipt = await this.activityService.process(activity);
    // return {
    //   status: 'accepted',
    //   message: 'The activity was queued for processing.',
    //   receipt
    // }

  }
}
