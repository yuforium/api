import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { SyncActivityStreamService } from './services/sync-activity-stream.service';
import { ObjectModule } from '../object/object.module';

@Module({
  imports: [ActivityModule, ObjectModule],
  exports: [SyncActivityStreamService],
  providers: [SyncActivityStreamService]
})
export class ActivityStreamModule {
}
