import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Module({
  providers: [ActivityService]
})
export class ActivityModule {}
