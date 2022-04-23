import { Module } from '@nestjs/common';
import { ForumController } from './controllers/forum.controller';
import { InboxController } from './controllers/inbox/inbox.controller';
import { ObjectModule } from '../object/object.module';

@Module({
  controllers: [ForumController, InboxController],

  imports: [
    ObjectModule
  ],

  providers: []
})
export class ForumModule
{
}
