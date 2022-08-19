import { Body, Req, Controller, Get, NotImplementedException, Param, Post, SerializeOptions, UnauthorizedException, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ActivityStreams, Create, OrderedCollection, OrderedCollectionPage } from '@yuforium/activity-streams-validator';
import { plainToClass } from 'class-transformer';
import { ServiceId } from 'src/common/decorators/service-id.decorator';
import { SyncActivityStreamService } from 'src/modules/activity/services/sync-activity-stream.service';
import { NoteCreateDto } from '../../../common/dto/note-create.dto';
import { ActivityService } from '../../activity/services/activity.service';
import { ObjectService } from '../../object/object.service';
import { UserParamsDto } from '../dto/user-params.dto';
import { Request } from 'express';

@Controller('user/:username/outbox')
@ApiTags('activity-pub')
export class UserOutboxController {
  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService,
    protected readonly activityStreamService: SyncActivityStreamService
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
    @Req() req: Request,
    @Body() noteDto: NoteCreateDto
  ) {
    if (noteDto instanceof ActivityStreams.Activity) {
      throw new NotImplementedException('Activity objects are not supported at this time.');
    }

    const userId = `https://${serviceId}/user/${params.username}`;

    // @todo - auth should be done via decorator on the class method
    if (userId !== (req.user as any).actor.id) {
      throw new UnauthorizedException('You are not authorized to post to this user\'s outbox.');
    }

    noteDto.attributedTo = (req.user as any).actor.id;
    noteDto.published = (new Date()).toISOString();

    noteDto.to = Array.isArray(noteDto.to) ? noteDto.to : [noteDto.to as string];

    const activity = new Create();
    activity.id = `https://${serviceId}/user/${params.username}/outbox/${(await this.activityStreamService.id()).toString()}`;
    activity.actor = userId;
    activity.object = noteDto;

    return await this.activityStreamService.create(activity);
    // const {activity} = await this.objectService.create(serviceId, `https://${serviceId}/user/${params.username}`, 'note', noteDto);
    return plainToClass(ActivityStreams.Activity, activity);
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
