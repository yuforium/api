import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { ObjectModule } from '../object/object.module';
import { UserModule } from '../user/user.module';
import { ActivityPubService } from './services/activity-pub.service';
import { InboxProcessorService } from './services/inbox-processor.service';
import { InboxService } from './services/inbox.service';
import { SyncDispatchService } from './services/sync-dispatch.service';

@Module({
  providers: [InboxService, ActivityPubService, InboxProcessorService, SyncDispatchService],
  exports: [InboxService, SyncDispatchService],
  imports: [
    ActivityModule,
    ObjectModule,
    forwardRef(() => UserModule),
    HttpModule
  ]
})
export class ActivityPubModule {}
