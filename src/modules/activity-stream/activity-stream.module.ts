import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { SyncActivityStreamService } from './services/sync-activity-stream.service';
import { ObjectModule } from '../object/object.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ActivityModule,
    ObjectModule,
    HttpModule,
  ],
  exports: [SyncActivityStreamService],
  providers: [
    SyncActivityStreamService
  ]
})
export class ActivityStreamModule {
}