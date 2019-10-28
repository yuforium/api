import { Module } from '@nestjs/common';
import { ForumsService } from './services/forums.service';
import { MessagesService } from './services/messages.service';
import { ForumsController } from './forums.controller';

@Module({
  controllers: [ForumsController]
})
export class ForumsModule {
	providers: [
		ForumsService,
		MessagesService
	]
}
