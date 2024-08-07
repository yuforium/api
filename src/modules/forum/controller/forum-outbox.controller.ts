import { Body, Controller, Get, Logger, NotFoundException, NotImplementedException, Param, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ActivityService } from '../../../modules/activity/service/activity.service';
import { ObjectService } from '../../../modules/object/object.service';
import { ForumParams } from '../dto/forum-params.dto';
import { ServiceDomain } from '../../../common/decorators/service-domain.decorator';
import { User } from '../../../common/decorators/user.decorator';
import { JwtUser } from '../../../modules/auth/auth.service';
import { ActivityStreamsPipe } from '../../../common/pipes/activity-streams.pipe';
import { ObjectCreateTransformer } from '../../../common/transformer/object-create.transformer';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';
import { ObjectCreateDto } from '../../object/dto/object-create/object-create.dto';
import { NoteCreateDto } from '../../object/dto/object-create/note-create.dto';
import { AuthGuard } from '@nestjs/passport';
import { OutboxService } from '../../activity/service/outbox.service';

/**
 * Forum Outbox Controller
 * Note that this controller has a lot of overlap to the UserOutboxController.  This functionality can probably be merged into a
 * parent class.
 */
@Controller('forums/:forumname/outbox')
@ApiTags('forum')
export class ForumOutboxController {
  protected readonly logger = new Logger(ForumOutboxController.name);

  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    protected readonly outboxService: OutboxService
  ) { }

  @ApiBearerAuth()
  @ApiBody({schema: {oneOf: [{$ref: getSchemaPath(NoteCreateDto)}]}})
  @ApiExtraModels(NoteCreateDto)
  @ApiOperation({operationId: 'postForumOutbox', summary: 'Post to a forum outbox'})
  @UseGuards(AuthGuard('jwt'))
  @Post()
  public async postForumOutbox(
    @Param() params: ForumParams,
    @ServiceDomain() domain: string,
    @User() user: JwtUser,
    @Body(new ActivityStreamsPipe(ObjectCreateTransformer)) dto: ObjectCreateDto | NoteCreateDto
  ) {
    if (dto instanceof ActivityDto) {
      throw new NotImplementedException('Activity objects are not supported at this time.');
    }

    const forumId = `https://${domain}/forums/${params.forumname}`;
    const forum = await this.objectService.get(forumId);

    if (!forum) {
      throw new NotFoundException(`Forum ${forumId} not found.`);
    }

    const actorRecord = await this.objectService.get(user.actor.id);

    // @todo - auth should be done via decorator on the class method
    if (!actorRecord || actorRecord.type === 'Tombstone') {
      this.logger.error(`Unauthorized access to forum outbox by ${user.actor.id}`);
      throw new UnauthorizedException('You are not authorized to post to this outbox.');
    }

    this.logger.debug(`postOutbox(): ${user.actor.preferredUsername} is posting to ${params.forumname}'s outbox`);

    // @todo document how and why to/cc are set for various targets
    // see also https://github.com/mastodon/mastodon/issues/8067 and https://github.com/mastodon/mastodon/pull/3844#issuecomment-314897285
    const createDto = {
      ...dto,
      '@context': 'https://www.w3.org/ns/activitystreams',
      attributedTo: [forumId, user.actor.id], // @todo document that attributedTo is an array with the first element being the outbox, last being the actual person
      published: new Date().toISOString(),
      context: `https://yuforium.com/community/${params.forumname}`, // @todo replace with whatever the forum has as its context
      to: ['https://www.w3.org/ns/activitystreams#Public'],
      cc: [`${forumId}/followers`], // cc: is most appropriate for federation
      audience: forumId // represents the primary audience for the post.  In Yuforium, this is the forum, and not the context which would be considered as a wider scope than the audience
    };

    const activity = await this.outboxService.createObject(domain, user, forumId, createDto);

    return activity;
  }

  @ApiOperation({operationId: 'getForumOutbox', summary: 'Get a forum outbox'})
  @Get()
  public getOutbox(@ServiceDomain() _domain: string, @Param() _params: ForumParams) {
    throw new NotImplementedException('Not implemented');
  }
}
