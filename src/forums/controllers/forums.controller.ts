import { Controller, Get, Param, Post, Patch, Body } from '@nestjs/common';
import { ApiResponse, ApiProperty, ApiTags, ApiParam, ApiHeader } from '@nestjs/swagger';
import { ForumsService } from '../services/forums.service';
import { Forum } from '../models/forum.model';

class CreateForumDto
{
	@ApiProperty()
	name?: string

	@ApiProperty()
	description?: string
}

@ApiTags("forums")
@Controller('forums')
export class ForumsController 
{
	constructor (protected forumsService: ForumsService)
	{
	}

	@ApiResponse({status: 200, description: "Successful response"})
	@ApiResponse({status: 400, description: "Forum does not exist"})
	@Get(":path")
	public async getForum (@Param('path') path: string): Promise<Forum | object>
	{
		const id = path.toLowerCase()

		return {
			type:          "Forum",
			"@context":    "https://www.yuforium.com/ns/activitystreams",
			id:            `https://yuforium.com/${id}`,
			inbox:         `https://www.yuforia.com/${id}/inbox`,
			outbox:        `https://www.yuforia.com/${id}/outbox`,
			preferredName: `${path} Forum`
		}

		// return await this.forumsService.get(path) || {name: null, description: null, path, founded: false}
	}

	@ApiResponse({status: 201, description: "Created"})
	@Post(":path")
	public createForum (@Param("path") path: string, @Body() createForumDto: CreateForumDto)
	{
		return this.forumsService.create(Object.assign(createForumDto, {path}))
	}


	@Patch(":forumId")
	public updateForum (@Param("forumId") forumId: string)
	{
	}
}
