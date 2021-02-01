import { Controller, Post } from '@nestjs/common';

@Controller('shared-inbox')
export class SharedInboxController {
	@Post()
	postInbox() {
		return "Post To Inbox";
	}
}
