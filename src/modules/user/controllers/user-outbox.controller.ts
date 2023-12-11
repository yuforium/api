import { Body, Req, Controller, Get, NotImplementedException, Param, Post, UnauthorizedException, UseGuards, Logger, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ASObject, OrderedCollection, OrderedCollectionPage } from '@yuforium/activity-streams';
import { plainToClass } from 'class-transformer';
import { ServiceDomain } from '../../../common/decorators/service-domain.decorator';
import { SyncActivityStreamService } from '../../../modules/activity-stream/services/sync-activity-stream.service';
import { NoteCreateDto } from '../../../common/dto/object-create/note-create.dto';
import { ActivityService } from '../../activity/services/activity.service';
import { ObjectService } from '../../object/object.service';
import { UserParamsDto } from '../dto/user-params.dto';
import { Request } from 'express';
import { User } from '../../../common/decorators/user.decorator';
import { OutboxDispatchService } from '../../activity-pub/services/outbox-dispatch.service';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';
import { ActivityStreamsPipe } from '../../../common/pipes/activity-streams.pipe';
import { ObjectCreateDto } from '../../../common/dto/object-create/object-create.dto';
import { ObjectCreateTransformer } from '../../../common/transformer/object-create.transformer';
import { JwtUser } from '../../../modules/auth/auth.service';

type AllowedCreate = ObjectCreateDto | NoteCreateDto

interface OutboxObjectCreateDto extends ObjectCreateDto {
  serviceId: string;
  _originPath: string;
}

@Controller('users/:username/outbox')
@ApiTags('activity-pub')
export class UserOutboxController {
  protected readonly logger = new Logger(UserOutboxController.name);

  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    protected readonly activityStreamService: SyncActivityStreamService,
    protected readonly outboxService: OutboxDispatchService
  ) { }

  @ApiBearerAuth()
  @ApiBody({type: NoteCreateDto})
  @ApiParam({name: 'username', type: 'string'})
  @ApiOperation({operationId: 'postUserOutbox'})
  @UseGuards(AuthGuard('jwt'))
  @Post()
  public async postOutbox(
    @Param() params: UserParamsDto,
    @ServiceDomain() serviceDomain: string,
    @User() user: JwtUser,
    @Req() req: Request,
    @Body(new ActivityStreamsPipe(ObjectCreateTransformer)) dto: ASObject
  ) {
    if (dto instanceof ActivityDto) {
      throw new NotImplementedException('Activity objects are not supported at this time.');
    }

    const userId = `https://${serviceDomain}/users/${params.username}`;
    const actorRecord = await this.objectService.get(user.actor.id);

    // @todo - auth should be done via decorator on the class method
    if (!actorRecord || actorRecord.type === 'Tombstone' || userId !== user.actor.id) {
      this.logger.error(`Unauthorized access to outbox for ${userId} by ${user.actor.id}`);
      throw new UnauthorizedException('You are not authorized to post to this outbox.');
    }

    this.logger.debug(`postOutbox(): ${params.username} creating a ${dto.type}`)

    Object.assign(dto, {
      attributedTo: (req.user as any).actor.id,
      published: (new Date()).toISOString(),
      to: Array.isArray(dto.to) ? dto.to : [dto.to as string]
    });

    const _originPath = `users/${params.username}`;

    const activity = await this.outboxService.createActivityFromObject<OutboxObjectCreateDto>(serviceDomain, user, {...dto as ObjectCreateDto, serviceId: serviceDomain, _originPath});

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
  public async getOutbox(@ServiceDomain() serviceId: string, @Param() params: UserParamsDto, @Req() req: Request): Promise<OrderedCollection> {
    const collection = new OrderedCollection();
    const actor = `https://${serviceId}/user/${params.username}`;
    const filter: any = {actor, 'object.to': 'https://www.w3.org/ns/activitystreams#Public'};

    collection.totalItems = await this.activityService.count(filter);
    collection.first = `https://${serviceId}/user/${params.username}/outbox/first`;
    // collection.orderedItems = activities.map(item => plainToClass(ActivityStreams.Activity, item));

    return collection;
  }

  /**
   * User outbox page scoped to public activities
   * @param serviceId
   * @param username
   * @param page
   * @param req
   * @returns
   */
  @ApiOperation({operationId: 'getUserOutboxPage'})
  @ApiParam({name: 'username', type: 'string'})
  @ApiParam({name: 'page'})
  @UseGuards(AuthGuard(['anonymous', 'jwt']))
  @Get('page/:page')
  public async getOutboxPage(
    @ServiceDomain() serviceId: string,
    @Param() params: UserParamsDto,
    @Param('page') page: number,
    @Req() req: Request):
  Promise<OrderedCollectionPage> {
    const collectionPage = new OrderedCollectionPage();
    const actor = `https://${serviceId}/user/${params.username}`;
    const filter: any = {actor, 'object.to': 'https://www.w3.org/ns/activitystreams#Public'};

    // collectionPage.orderedItems = await this.activityService.find(filter);
    return collectionPage;
  }
}
