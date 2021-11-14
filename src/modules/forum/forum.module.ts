import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ForumService } from './services/forum.service';
import { ForumController } from './controllers/forum.controller';
import { Forum } from './models/forum.model';
import { InboxController } from './controllers/inbox/inbox.controller';
import { ForumSchema } from './schemas/forum.schema';

@Module({
  controllers: [ForumController, InboxController],

  imports: [
    MongooseModule.forFeature([{name: 'Forum', schema: ForumSchema}]),
    // TypegooseModule.forFeature([Forum]),
  ],

  providers: [ForumService]
})
export class ForumModule
{
}
