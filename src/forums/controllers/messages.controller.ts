import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';

@ApiUseTags("forums")
@Controller('forums/:forumId')
export class MessagesController 
{
	@Get("forums/:forumId/messages")
	public getIndex (@Param("forumId") forumId: string, @Param("messageId") messageId: string)
	{

	}

	@Post("messages")
	public createMessage ()
	{

	}

	@Get("inbox")
	public getInbox (@Param("forumId") forumId: string)
	{
		return
	}

	@Post("inbox")
	public postInbox (@Param("forumId") forumId: string)
	{

	}

	@Get(":messageId")
	public getMessage (@Param("messageId") messageId: string)
	{

	}
}
