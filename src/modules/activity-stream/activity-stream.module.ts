import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityStreamService } from './activity-stream.service';
import { Activity, ActivitySchema } from './schema/activity.schema';
import { BaseObject, BaseObjectSchema } from './schema/base-object.schema';

@Module({
  providers: [ActivityStreamService],
  exports: [ActivityStreamService],
  imports: [
    MongooseModule.forFeature([{name: BaseObject.name, schema: BaseObjectSchema}]),
    MongooseModule.forFeature([{name: Activity.name, schema: ActivitySchema}])
  ]
})
export class ActivityStreamModule {}
