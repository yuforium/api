import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityService } from './services/activity.service';
import { ActivitySchema } from './schema/activity.schema';
import { HttpModule } from '@nestjs/axios';
import { OutboxService } from './services/outbox.service';
import { ObjectModule } from '../object/object.module';
import { InboxService } from './services/inbox.service';
import { InboxProcessorService } from './services/inbox-processor.service';

@Module({
  providers: [
    ActivityService,
    InboxService,
    InboxProcessorService,
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
    InboxService,
    InboxProcessorService,
    OutboxService
  ],
  controllers: []
})
export class ActivityModule { }
