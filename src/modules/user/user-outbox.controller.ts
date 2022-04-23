import { Body, ClassSerializerInterceptor, Controller, Get, NotImplementedException, Param, Post, Request, SerializeOptions, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActivityStreams } from '@yuforium/activity-streams-validator';
import { plainToClass } from 'class-transformer';
import { ServiceId } from 'src/common/decorators/service-id.decorator';
import { NoteCreateDto } from '../../common/dto/note-create.dto';
import { ActivityService } from '../activity/services/activity.service';
import { ObjectService } from '../object/object.service';

@Controller('user/:username/outbox')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({excludeExtraneousValues: true})
@ApiTags('user-outbox')
export class UserOutboxController {
  constructor(
    protected readonly activityService: ActivityService,
    protected readonly objectService: ObjectService
  ) { }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post()
  public async postOutbox(@Param('username') username: string, @ServiceId() serviceId: string, @Request() req, @Body() noteDto: NoteCreateDto) {
    if (noteDto instanceof ActivityStreams.Activity) {
      throw new NotImplementedException('Activity objects are not supported at this time.');
    }
    noteDto.attributedTo = req.user.actor.id;
    noteDto.published = (new Date()).toISOString();
    const {activity, object} = await this.objectService.create(serviceId, `https://${serviceId}/user/${username}`, 'note', noteDto);
    return plainToClass(ActivityStreams.Activity, activity, { excludeExtraneousValues: true});
  }

  @UseGuards(AuthGuard(['anonymous', 'jwt']))
  @Get()
  public async getOutbox(@ServiceId() serviceId: string, @Param('username') username: string, @Request() req) {
    const actor = `https://${serviceId}/user/${username}`;
    const filter: any = {actor};

    if (req.user.actor?.id !== actor) {
      filter['object.to'] = 'https://www.w3.org/ns/activitystreams#Public';
    }

    const activities = await this.activityService.find(filter);
    const response = activities.map(item => plainToClass(ActivityStreams.Activity, item));

    return response;
  }
}
