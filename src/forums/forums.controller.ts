import { Controller, Get, Param, Post } from '@nestjs/common';

@Controller('forums')
export class ForumsController 
{
	@Get(":forumId")
	public getForum (@Param('forumId') forumId: string): object
	{
		return {
			id: forumId
		}
	}

	@Post(":forumId")
	public updateForum (@Param("forumId") forumId: string)
	{

	}
}
