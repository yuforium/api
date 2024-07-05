import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Logger, Param, Post, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Note } from '@yuforium/activity-streams';
import { plainToClass } from 'class-transformer';
import { ServiceDomain } from '../../../common/decorators/service-domain.decorator';
import { ObjectService } from '../../../modules/object/object.service';
import { ActivityService } from '../../activity/service/activity.service';
import { Request } from 'express';
import { ObjectDocument } from '../../../modules/object/schema/object.schema';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';
import { InboxService } from '../../../modules/activity/service/inbox.service';

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

  /**
   * Inbox POST request handler
   * @param domain Domain for which the activity was received
   * @param req Request object, used to log the IP address on receipt of an activity
   * @param dto Activity object received in the request body.  Any (json) is permitted here, since we want to preserve the original object. @todo validate this
   * @param username Username of the user to receive the activity
   * @returns Accepted status object
   */
  @ApiBearerAuth() // @todo is this necessary? a token can be passed to authenticate the user but it's completely optional (could be used to bypass rate limiting)
  @ApiOperation({ operationId: 'postInbox' })
  @ApiParam({ name: 'username', required: true, type: String, 'description': 'The username of the user to get the inbox for.' })
  @Post()
  @UseGuards(AuthGuard(['jwt', 'anonymous']))
  @HttpCode(HttpStatus.ACCEPTED)
  public async postInbox(
    @ServiceDomain() domain: string, @Req() req: RawBodyRequest<Request>, @Body() dto: ActivityDto, @Param('username') username: string
  ) {
    const targetUserId = `https://${domain}/user/${username}`;

    if (!req.rawBody) {
      throw new BadRequestException('The request body is empty.');
    }

    const raw = JSON.stringify(JSON.parse(req.rawBody.toString('utf-8')), null, 4);

    // if (typeof activity.object.to === 'string' && activity.object.to !== targetUserId) {
    //   throw new BadRequestException(`The activity is not intended for the user ${targetUserId}.`);
    // }
    // else if (Array.isArray(activity.object.to) && !activity.object.to.includes(targetUserId)) {
    //   throw new BadRequestException(`The activity is not intended for the user ${targetUserId}.`);
    // }

    this.logger.debug(`postInbox(): Received "${dto.type}" activity for ${targetUserId} from ${req.socket.remoteAddress}`);

    try {
      await this.inboxService.receive<ActivityDto>(dto, raw, {requestSignature: {headers: req.headers, path: `/users/${username}/inbox`, method: 'post'}});
    }
    catch (e: any) {
      this.logger.error(`postInbox(): Activity "${dto.type}" for ${targetUserId} from ${req.socket.remoteAddress} was rejected: ${e.message}`);
      throw e;
    }

    this.logger.debug(`postInbox(): Activity "${dto.type}" for ${targetUserId} from ${req.socket.remoteAddress} was accepted`);

    return {
      'status': 'Accepted',
      'id': dto.id,
    };
  }
}
