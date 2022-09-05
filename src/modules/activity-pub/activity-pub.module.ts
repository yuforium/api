import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { ObjectModule } from '../object/object.module';
import { ActivityPubService } from './services/activity-pub.service';
import { InboxService } from './services/inbox.service';
import { OutboxService } from './services/outbox.service';

@Module({
  providers: [InboxService, OutboxService, ActivityPubService],
  exports: [InboxService, OutboxService],
  imports: [
    ActivityModule,
    ObjectModule
  ]
})
export class ActivityPubModule {}
