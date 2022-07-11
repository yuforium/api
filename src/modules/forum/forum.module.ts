import { Module } from '@nestjs/common';
import { ForumController } from './controllers/forum.controller';
import { ObjectModule } from '../object/object.module';
import { ActivityModule } from '../activity/activity.module';
import { ForumService } from './forum.service';
import { ForumInboxController } from './controllers/forum-inbox.controller';

@Module({
  controllers: [
    ForumController,
    ForumInboxController
  ],

  imports: [
    ObjectModule,
    ActivityModule
  ],

  providers: [ForumService]
})
export class ForumModule {

}
