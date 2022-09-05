import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityService } from './services/activity.service';
import { ActivitySchema } from './schema/activity.schema';
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
  controllers: []
})
export class ActivityModule { }
