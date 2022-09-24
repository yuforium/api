import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ActivityDto } from '../../../modules/activity/dto/activity.dto';
import { ActivityService } from '../../../modules/activity/services/activity.service';

@Injectable()
export class InboxService {
  protected logger = new Logger(InboxService.name);

  constructor(
    protected readonly activityService: ActivityService,
  ) { }

  /**
   * Accept an incoming activity.
   */
  public async accept(activity: ActivityDto) {
    const { type } = activity;

    switch (type) {
      case 'Create':
        return this.acceptCreate(activity);
    }
  }

  protected async acceptCreate(activity: ActivityDto): Promise<ActivityDto | null> {
    if (await this.activityService.find(activity.id)) {
      this.logger.debug(`acceptCreate(): activity already exists`);
      return null;
    }

    const activityDto = plainToInstance(ActivityDto, await this.activityService.create(activity), { excludeExtraneousValues: true });

    return activityDto;
  }
}
