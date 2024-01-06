import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityService } from './services/activity.service';
import { ActivitySchema } from './schema/activity.schema';
import { HttpModule } from '@nestjs/axios';
import { OutboxService } from './services/outbox.service';
import { ObjectModule } from '../object/object.module';

@Module({
  providers: [
    ActivityService,
    OutboxService
  ],
  imports: [
    MongooseModule.forFeature([
      {name: 'Activity', schema: ActivitySchema}
    ]),
    HttpModule,
    ObjectModule
  ],
  exports: [
    ActivityService,
    OutboxService
  ],
  controllers: []
})
export class ActivityModule { }
