import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectModule } from '../object/object.module';
import { ActivityService } from './activity.service';
import { ActivitySchema } from './schema/activity.schema';
import { ActivityController } from './activity.controller';

@Module({
  providers: [ActivityService],
  imports: [
    ObjectModule,
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
