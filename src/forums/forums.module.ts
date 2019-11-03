import { Module } from '@nestjs/common';
import { ForumsService } from './services/forums.service';
import { MessagesService } from './services/messages.service';
import { ForumsController } from './controllers/forums.controller';
import { MessagesController } from './controllers/messages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchema } from './schemas/message.schema';
import { ForumSchema } from './schemas/forum.schema';
import { TypegooseModule } from 'nestjs-typegoose';
import { Forum } from './models/forum.model';

@Module({
	controllers: [ForumsController, MessagesController],
	imports:
	[
		TypegooseModule.forFeature([Forum]),
		MongooseModule.forFeature([
			{name: "Message", schema: MessageSchema},
			{name: "Forum", schema: ForumSchema}
		])
	],

	providers: [ForumsService, MessagesService]
})
export class ForumsModule 
{
}
