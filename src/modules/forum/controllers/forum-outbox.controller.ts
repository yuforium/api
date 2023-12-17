import { Body, Controller, Logger, NotImplementedException, Param, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { OutboxService } from '../../activity-pub/services/outbox.service';
import { SyncActivityStreamService } from '../../../modules/activity-stream/services/sync-activity-stream.service';
import { ActivityService } from '../../../modules/activity/services/activity.service';
import { ObjectService } from '../../../modules/object/object.service';
import { ForumParams } from '../dto/forum-params.dto';
import { ServiceDomain } from '../../../common/decorators/service-domain.decorator';
import { User } from '../../../common/decorators/user.decorator';
import { JwtUser } from '../../../modules/auth/auth.service';
import { ActivityStreamsPipe } from '../../../common/pipes/activity-streams.pipe';
import { ObjectCreateTransformer } from '../../../common/transformer/object-create.transformer';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';
import { ObjectCreateDto } from '../../../common/dto/object-create/object-create.dto';
import { NoteCreateDto } from '../../../common/dto/object-create/note-create.dto';
import { AuthGuard } from '@nestjs/passport';
import { ObjectDto } from '../../../common/dto/object';

interface OutboxObjectCreateDto extends ObjectCreateDto {
  serviceId: string;
}

/**
 * Forum Outbox Controller
 * Note that this controller has a lot of overlap to the UserOutboxController.  This functionality can probably be merged into a 
 * parent class.
 */
@Controller('forums/:pathId/outbox')
@ApiTags('forum')
export class ForumOutboxController {
  protected readonly logger = new Logger(ForumOutboxController.name);

  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    protected readonly activityStreamService: SyncActivityStreamService,
    protected readonly outboxService: OutboxService
  ) { }

  @ApiBearerAuth()
  @ApiBody({schema: {oneOf: [{$ref: getSchemaPath(NoteCreateDto)}]}})
  @ApiExtraModels(NoteCreateDto)
  @ApiOperation({operationId: 'postOutbox', summary: 'Post to a forum outbox'})
  @UseGuards(AuthGuard('jwt'))
  @Post()
  public async postOutbox(
    @Param() params: ForumParams,
    @ServiceDomain() domain: string,
    @User() user: JwtUser,
    @Body(new ActivityStreamsPipe(ObjectCreateTransformer)) dto: ObjectCreateDto | NoteCreateDto
  ) {
    if (dto instanceof ActivityDto) {
      throw new NotImplementedException('Activity objects are not supported at this time.');
    }

    const forumId = `https://${domain}/forums/${params.pathId}`;
    const forum = await this.objectService.get(forumId) || Object.assign(new ObjectDto(), {
      id: forumId,
    });

    const actorRecord = await this.objectService.get(user.actor.id);

    // @todo - auth should be done via decorator on the class method
    if (!actorRecord || actorRecord.type === 'Tombstone') {
      this.logger.error(`Unauthorized access to forum outbox by ${user.actor.id}`);
      throw new UnauthorizedException('You are not authorized to post to this outbox.');
    }

    this.logger.debug(`postOutbox(): ${user.actor.preferredUsername} is posting to ${params.pathId}'s outbox`);

    // @todo document how and why to/cc are set for various targets
    // see also https://github.com/mastodon/mastodon/issues/8067 and https://github.com/mastodon/mastodon/pull/3844#issuecomment-314897285
    Object.assign(dto, {
      attributedTo: [user.actor.id, `https://${domain}/forums/${params.pathId}`], // @todo document that attributedTo is an array with the first element being the primary source, everything following it is considered "on behalf of" in that order
      published: new Date().toISOString(),
      to: ['https://www.w3.org/ns/activitystreams#Public'],
      cc: [`${params.pathId}/followers`], // @todo consider 
    });

    const activity = await this.outboxService.createActivityFromObject(domain, user, dto);

    return activity;
  }
}
