import { Module } from '@nestjs/common';
import { ForumController } from './controllers/forum.controller';
import { InboxController } from './controllers/inbox/inbox.controller';
import { ObjectModule } from '../object/object.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  controllers: [ForumController, InboxController],

  imports: [
    ObjectModule,
    ActivityModule
  ],

  providers: []
})
export class ForumModule {

}
