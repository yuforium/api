import { Controller, Get, Param, Post } from '@nestjs/common';

@Controller('forum/:forumId/message')
export class MessagesController {

	@Get()
	public getForumIndex (@Param("forumId") forumId: string): string[]
	{
		return ['a', 'b', 'c', 'd', 'e', "e"]
	}

	@Post()
	public createPost (@Param("forumId") forumId: string): string[]
	{
		return []
	}

	@Get()
	public getMessage (@Param("forumId") forumId: string): string[]
	{
		return []
	}
}
