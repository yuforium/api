import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityService } from './activity.service';
import { ActivitySchema } from './schema/activity.schema';
import { ActivityController } from './activity.controller';

@Module({
  providers: [ActivityService],
  imports: [
    MongooseModule.forFeature([
      {name: 'Activity', schema: ActivitySchema}
    ])
  ],
  exports: [
    ActivityService
  ],
  controllers: [ActivityController]
})
export class ActivityModule { }
