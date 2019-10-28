import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchema } from './schema/message.schema';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';

@Module({
	imports: [MongooseModule.forFeature([{name: "Message", schema: MessageSchema}])],
	providers: [MessagesService],
	controllers: [MessagesController]
})
export class MessagesModule {}
