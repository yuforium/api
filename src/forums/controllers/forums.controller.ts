import { Controller, Get, Param, Post, Patch, Body, Req, RequestTimeoutException, SerializeOptions, UseInterceptors, ClassSerializerInterceptor, NotFoundException } from '@nestjs/common';
import { ApiResponse, ApiProperty, ApiTags, ApiParam, ApiHeader } from '@nestjs/swagger';
import { ForumsService } from '../services/forums.service';
import { Forum } from '../models/forum.model';
import { CreateForumDto } from '../dto/create-forum.dto';
import { request } from 'http';
import { ForumParams } from '../dto/forum-params.dto';
import { ClassTransformOptions } from '@nestjs/common/interfaces/external/class-transform-options.interface';
import { classToPlain } from 'class-transformer';

const serializeOptions: ClassTransformOptions = {
  excludePrefixes: ['_']
};

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('forums')
@Controller('forum')
export class ForumsController {

  constructor (protected forumsService: ForumsService) { }

  protected toForumResponse(forum: any) {
    return Object.assign({
      inbox:     `http:${forum.id}/inbox`,
      outbox:    `http:${forum.id}/outbox`,
      followers: `http:${forum.id}/followers`,
      following: `http:${forum.id}/following`,
      liked:     `http:${forum.id}/liked`
    }, classToPlain(forum, serializeOptions));
  }

  @Get()
  public async getAll(@Req() request) {
    return (await this.forumsService.find()).map(this.toForumResponse);
  }

  @ApiResponse({status: 200, description: "Successful response"})
  @ApiResponse({status: 404, description: "Forum does not exist"})
  @Get(':path')
  public async getForum (@Req() request, @Param() params: ForumParams) {
    const
      path    = params.path.toLowerCase(),
      forumId = `//${request.hostname}/forum/${path}`,
      forum   = await this.forumsService.get(forumId);

    if (!forum) {
      throw new NotFoundException();
    }

    return this.toForumResponse(forum);
  }

  @ApiResponse({status: 201, description: "New forum created"})
  @Post(':path')
  public createForum (@Req() request, @Param() params: ForumParams, @Body() createForumDto: CreateForumDto) {
    const 
      path  = params.path.toLowerCase(),
      forum = Object.assign({id: `//${request.hostname}/forum/${path}`, path}, createForumDto);

    return this.forumsService.create(forum);
  }

  @Patch(':path')
  public updateForum(@Req() request, @Param() params: ForumParams) {
    const 
      id = `//${request.hostname}/forum/${params.path}`,
      forum = this.forumsService.get(id);
    
    if (!forum) {
      throw new NotFoundException();
    }

    // @todo update logic here
  }
}
