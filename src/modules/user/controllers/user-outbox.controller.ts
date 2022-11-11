import { Body, Req, Controller, Get, NotImplementedException, Param, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Actor, OrderedCollection, OrderedCollectionPage } from '@yuforium/activity-streams';
import { plainToClass } from 'class-transformer';
import { ServiceId } from '../../../common/decorators/service-id.decorator';
import { SyncActivityStreamService } from 'src/modules/activity-stream/services/sync-activity-stream.service';
import { NoteCreateDto } from '../../../common/dto/create/note-create.dto';
import { ActivityService } from '../../activity/services/activity.service';
import { ObjectService } from '../../object/object.service';
import { UserParamsDto } from '../dto/user-params.dto';
import { Request } from 'express';
import { User } from 'src/common/decorators/user.decorator';
import { OutboxService } from 'src/modules/activity-pub/services/outbox.service';
import { ActivityDto } from 'src/modules/activity/dto/activity.dto';
import { ActivityStreamsPipe } from 'src/common/pipes/activity-streams.pipe';
import { ObjectCreateDto } from 'src/common/dto/create/object-create.dto';
import { CreateTransformer } from 'src/common/transformer/create.transformer';

type AllowedCreate = ObjectCreateDto | NoteCreateDto

@Controller('user/:username/outbox')
@ApiTags('activity-pub')
export class UserOutboxController {
  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    protected readonly activityStreamService: SyncActivityStreamService,
    protected readonly outboxService: OutboxService
  ) { }

  @ApiBearerAuth()
  @ApiBody({type: NoteCreateDto})
  @ApiParam({name: 'username', type: 'string'})
  @ApiOperation({operationId: 'postUserOutbox'})
  @UseGuards(AuthGuard('jwt'))
  @Post()
  public async postOutbox(
    @Param() params: UserParamsDto,
    @ServiceId() serviceId: string,
    @User('actor') actor: Actor,
    @Req() req: Request,
    @Body(new ActivityStreamsPipe(CreateTransformer)) dto: NoteCreateDto
  ) {
    if (dto instanceof ActivityDto) {
      throw new NotImplementedException('Activity objects are not supported at this time.');
    }

    NoteCreateDto.prototype.type;

    const userId = `https://${serviceId}/user/${params.username}`;

    // @todo - auth should be done via decorator on the class method
    if (userId !== actor.id) {
      throw new UnauthorizedException('You are not authorized to post to this user\'s outbox.');
    }

    Object.assign(dto, {
      attributedTo: (req.user as any).actor.id,
      published: (new Date()).toISOString(),
      to: Array.isArray(dto.to) ? dto.to : [dto.to as string]
    })

    const activity = this.outboxService.create(serviceId, actor, dto);

    return plainToClass(ActivityDto, activity);
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
  public async getOutbox(@ServiceId() serviceId: string, @Param() params: UserParamsDto, @Req() req: Request): Promise<OrderedCollection> {
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
    @ServiceId() serviceId: string,
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
