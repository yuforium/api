import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityService } from './services/activity.service';
import { ActivitySchema } from './schema/activity.schema';
import { ActivityController } from './activity.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [
    ActivityService
  ],
  imports: [
    MongooseModule.forFeature([
      {name: 'Activity', schema: ActivitySchema}
    ]),
    HttpModule
  ],
  exports: [
    ActivityService
  ],
  controllers: [ActivityController]
})
export class ActivityModule { }
