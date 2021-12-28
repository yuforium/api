import { ClassSerializerInterceptor, Controller, Get, NotFoundException, Param, SerializeOptions, UseInterceptors } from '@nestjs/common';
import { ActivityStreams } from '@yuforium/activity-streams-validator';
import { plainToClass } from 'class-transformer';
import { ServiceId } from 'src/common/decorators/service-id.decorator';
import { ActivityService } from '../activity/activity.service';

@Controller('activity')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({excludeExtraneousValues: true})
export class ActivityController {
  constructor(protected readonly activityService: ActivityService) { }

  @Get(':activityId')
  public async get(@ServiceId() serviceId: string, @Param('activityId') id: string): Promise<any> {
    const activity = await this.activityService.get(`https://${serviceId}/activity/${id}`);

    if (!activity) {
      throw new NotFoundException();
    }

    return plainToClass(ActivityStreams.Activity, activity);
  }
}
