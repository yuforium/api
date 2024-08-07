import { Body, Req, Controller, Get, NotImplementedException, Param, Post, UnauthorizedException, UseGuards, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { OrderedCollection } from '@yuforium/activity-streams';
import { ServiceDomain } from '../../../common/decorators/service-domain.decorator';
import { NoteCreateDto } from '../../object/dto/object-create/note-create.dto';
import { ActivityService } from '../../activity/service/activity.service';
import { ObjectService } from '../../object/object.service';
import { UserParamsDto } from '../dto/user-params.dto';
import { Request } from 'express';
import { User } from '../../../common/decorators/user.decorator';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';
import { ActivityStreamsPipe } from '../../../common/pipes/activity-streams.pipe';
import { ObjectCreateDto } from '../../object/dto/object-create/object-create.dto';
import { ObjectCreateTransformer } from '../../../common/transformer/object-create.transformer';
import { JwtUser } from '../../../modules/auth/auth.service';
import { OutboxService } from '../../activity/service/outbox.service';
import { ArticleCreateDto } from '../../object/dto/object-create/article-create.dto';

@Controller('users/:username/outbox')
@ApiTags('user')
export class UserOutboxController {
  protected readonly logger = new Logger(UserOutboxController.name);

  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    protected readonly outboxService: OutboxService
  ) { }

  @ApiBearerAuth()
  @ApiBody({type: NoteCreateDto})
  @ApiParam({name: 'username', type: 'string'})
  @ApiOperation({operationId: 'postUserOutbox', summary: 'Post to user outbox'})
  @UseGuards(AuthGuard('jwt'))
  @Post()
  public async postOutbox(
    @Param() params: UserParamsDto,
    @ServiceDomain() domain: string,
    @User() user: JwtUser,
    @Req() req: Request,
    @Body(new ActivityStreamsPipe<ObjectCreateDto>(ObjectCreateTransformer, {groups: ['outbox']})) dto: ObjectCreateDto | NoteCreateDto | ArticleCreateDto
  ) {
    if (dto instanceof ActivityDto) {
      throw new NotImplementedException('Activity objects are not supported at this time.');
    }

    const userId = `https://${domain}/users/${params.username}`;
    const actorRecord = await this.objectService.get(user.actor.id);

    // @todo - auth should be done via decorator on the class method
    if (!actorRecord || actorRecord.type === 'Tombstone' || userId !== user.actor.id) {
      this.logger.error(`Unauthorized access to outbox for ${userId} by ${user.actor.id}`);
      throw new UnauthorizedException('You are not authorized to post to this outbox.');
    }

    this.logger.debug(`postOutbox(): ${params.username} creating a ${dto.type}`);

    const createDto = {
      ...dto,
      '@context': 'https://www.w3.org/ns/activitystreams',
      attributedTo: (req.user as any).actor.id,
      published: (new Date()).toISOString(),
      to: Array.isArray(dto.to) ? dto.to.map(i => i.toString()) : [dto.to.toString()]
    };

    const activity = this.outboxService.createObject(domain, user, userId, createDto);

    return activity;
  }

  /**
   * User outbox scoped to public activities
   * @param serviceId
   * @param username
   * @param req
   * @returns
   */
  @ApiOperation({operationId: 'getUserOutbox'})
  @ApiParam({name: 'username', type: 'string', required: true})
  @UseGuards(AuthGuard(['anonymous', 'jwt']))
  @Get()
  public async getOutbox(@ServiceDomain() serviceId: string, @Param() params: UserParamsDto): Promise<OrderedCollection> {
    const collection = new OrderedCollection();
    const actor = `https://${serviceId}/user/${params.username}`;
    const filter: any = {actor, 'object.to': 'https://www.w3.org/ns/activitystreams#Public'};

    collection.totalItems = await this.activityService.count(filter);
    collection.first = `https://${serviceId}/user/${params.username}/outbox/first`;
    // collection.orderedItems = activities.map(item => plainToClass(ActivityStreams.Activity, item));

    return collection;
  }
}
