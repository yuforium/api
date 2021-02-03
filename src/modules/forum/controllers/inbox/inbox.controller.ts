import { Controller, Get, Req, Param, Post } from '@nestjs/common';
import { ForumParams } from '../../dto/forum-params.dto';

@Controller('forum/:path/inbox')
export class InboxController {

	@Get()
	public getInbox(@Req() request, @Param() params: ForumParams) {
		// get all messages from this forum, used by clients
	}

	@Post()
	public postInbox(@Req() request, @Param() params: ForumParams) {
		// server to server federation
	}
}
