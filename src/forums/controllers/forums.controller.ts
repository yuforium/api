import { Controller, Get, Param, Post, Patch, Body } from '@nestjs/common';
import { ApiUseTags, ApiOperation, ApiResponse, ApiMethodNotAllowedResponse, ApiModelProperty } from '@nestjs/swagger';
import { ForumsService } from '../services/forums.service';
import { Forum } from '../models/forum.model';

class CreateForumDto
{
	@ApiModelProperty()
	name?: string

	@ApiModelProperty()
	description?: string
}

@ApiUseTags("forums")
@Controller('forums')
export class ForumsController 
{
	constructor (protected forumsService: ForumsService)
	{

	}

	@ApiOperation({title: "Get Forum", operationId: "getForum"})
	@ApiResponse({status: 200, description: "Successful response"})
	@Get(":path")
	public async getForum (@Param('path') path: string): Promise<Forum | object>
	{
		return await this.forumsService.get(path) || {name: null, description: null, path, founded: false}
	}

	@ApiOperation({title: "Create Forum", operationId: "createForum"})
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
