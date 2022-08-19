import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityService } from './services/activity.service';
import { ActivitySchema } from './schema/activity.schema';
import { ActivityController } from './activity.controller';
import { SyncActivityStreamService } from './services/sync-activity-stream.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [
    ActivityService,
    SyncActivityStreamService
  ],
  imports: [
    MongooseModule.forFeature([
      {name: 'Activity', schema: ActivitySchema}
    ]),
    HttpModule
  ],
  exports: [
    ActivityService,
    SyncActivityStreamService
  ],
  controllers: [ActivityController]
})
export class ActivityModule { }
