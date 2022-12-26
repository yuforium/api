import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { ObjectModule } from '../object/object.module';
import { ActivityPubService } from './services/activity-pub.service';
import { InboxProcessorService } from './services/inbox-processor.service';
import { InboxService } from './services/inbox.service';
import { OutboxProcessorService } from './services/outbox-processor.service';
import { OutboxService } from './services/outbox.service';

@Module({
  providers: [InboxService, OutboxService, ActivityPubService, InboxProcessorService, OutboxProcessorService],
  exports: [InboxService, OutboxService],
  imports: [
    ActivityModule,
    ObjectModule,
    HttpModule
  ]
})
export class ActivityPubModule {}
