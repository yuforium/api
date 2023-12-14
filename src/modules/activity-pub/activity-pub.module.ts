import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { ObjectModule } from '../object/object.module';
import { UserModule } from '../user/user.module';
import { ActivityPubService } from './services/activity-pub.service';
import { InboxProcessorService } from './services/inbox-processor.service';
import { InboxService } from './services/inbox.service';
import { OutboxService } from './services/outbox.service';
import { DispatchService } from './services/dispatch.service';

@Module({
  providers: [InboxService, OutboxService, ActivityPubService, InboxProcessorService, OutboxService, DispatchService],
  exports: [InboxService, OutboxService, DispatchService],
  imports: [
    ActivityModule,
    ObjectModule,
    forwardRef(() => UserModule),
    HttpModule
  ]
})
export class ActivityPubModule {}
