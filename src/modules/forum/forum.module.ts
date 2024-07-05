import { Module } from '@nestjs/common';
import { ForumController } from './controller/forum.controller';
import { ObjectModule } from '../object/object.module';
import { ActivityModule } from '../activity/activity.module';
import { ForumService } from './forum.service';
import { ForumInboxController } from './controller/forum-inbox.controller';
import { ForumOutboxController } from './controller/forum-outbox.controller';
import { ForumContentController } from './controller/forum-content.controller';

@Module({
  controllers: [
    ForumController,
    ForumInboxController,
    ForumOutboxController,
    ForumContentController
  ],

  imports: [
    ObjectModule,
    ActivityModule
  ],

  providers: [ForumService]
})
export class ForumModule {

}
