import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityService } from './activity.service';
import { Activity, ActivitySchema } from './schemas/activity.schema';

@Module({
  providers: [ActivityService],
  imports: [
    MongooseModule.forFeature([{name: Activity.name, schema: ActivitySchema}])
  ],
  exports: [ActivityService]
})
export class ActivityModule {}
