import { Controller, Get, Param, Post, Patch, Body, Req, UseInterceptors, ClassSerializerInterceptor, NotFoundException, SerializeOptions } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ForumParams } from '../dto/forum-params.dto';
import { classToPlain, plainToClass } from 'class-transformer';
import { ObjectService } from 'src/modules/object/object.service';
import { ServiceId } from 'src/common/decorators/service-id.decorator';
import { ForumResponseDto } from '../dto/forum-response.dto';

@ApiTags('forums')
@Controller('forum')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({excludeExtraneousValues: true})
export class ForumController {

  constructor(
    protected readonly objectService: ObjectService
  ) { }

  protected toForumResponse(forum: any) {
    return Object.assign({
      inbox:     `http:${forum.id}/inbox`,
      outbox:    `http:${forum.id}/outbox`,
      followers: `http:${forum.id}/followers`,
      following: `http:${forum.id}/following`,
      liked:     `http:${forum.id}/liked`
    }, classToPlain(forum));
  }

  @Get()
  public async find() {
    const forums = await this.objectService.find({type: 'Forum'});
    return forums.map(forum => plainToClass(ForumResponseDto, forum));
    // return (await this.forumService.find()).map(this.toForumResponse);
  }

  @ApiResponse({status: 200, description: "Successful response"})
  @ApiResponse({status: 404, description: "Forum does not exist"})
  @Get(':pathId')
  public async get(@ServiceId() serviceId: string, @Param('pathId') pathId: string) {
    const forum = await this.objectService.get(`https://${serviceId}/forum/${pathId}`);

    return plainToClass(ForumResponseDto, forum);
  }
}
