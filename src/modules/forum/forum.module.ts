import { Module } from '@nestjs/common';
import { ForumController } from './controllers/forum.controller';
import { ObjectModule } from '../object/object.module';
import { ActivityModule } from '../activity/activity.module';
import { ForumService } from './forum.service';
import { ForumInboxController } from './controllers/forum-inbox.controller';
import { ForumOutboxController } from './controllers/forum-outbox.controller';
import { ActivityPubModule } from '../activity-pub/activity-pub.module';
import { ActivityStreamModule } from '../activity-stream/activity-stream.module';

@Module({
  controllers: [
    ForumController,
    ForumInboxController,
    ForumOutboxController
  ],

  imports: [
    ObjectModule,
    ActivityModule,
    ActivityPubModule,
    ActivityStreamModule
  ],

  providers: [ForumService]
})
export class ForumModule {

}
