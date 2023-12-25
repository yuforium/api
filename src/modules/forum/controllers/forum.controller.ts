import { Controller, Get, Param, NotFoundException, Header, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToClass, plainToInstance } from 'class-transformer';
import { ObjectService } from '../../object/object.service';
import { ServiceDomain } from '../../../common/decorators/service-domain.decorator';
import { ForumDto } from '../dto/forum.dto';
import { ForumCollectionDto } from '../dto/forum-collection.dto';
import { ForumParams } from '../dto/forum-params.dto';
import { ForumService } from '../forum.service';
import { ForumCreateDto } from '../../../common/dto/forum-create.dto';
import { ObjectDocument } from '../../../modules/object/schema/object.schema';
import { ActorDto } from 'src/common/dto/actor/actor.dto';

@ApiTags('forum')
@Controller('forums')
export class ForumController {
  constructor(
    protected readonly forumService: ForumService,
    protected readonly objectService: ObjectService
  ) { }

  @ApiOperation({operationId: 'findForums', summary: 'Find forums'})
  @Get()
  @Header('Content-Type', 'application/activity+json')
  public async findForums() {
    const forums = await this.objectService.find({type: 'Forum'});
    const collection = new ForumCollectionDto();
    collection.items = forums.map((item: ObjectDocument) => plainToInstance(ForumDto, item));

    return collection;
  }

  @ApiOperation({operationId: 'createForum', summary: 'Create a forum'})
  @Post()
  @Header('Content-Type', 'application/activity+json')
  public async create(@ServiceDomain() domain: string, @Body() forumCreateDto: ForumCreateDto): Promise<ActorDto> {
    return plainToInstance(ActorDto, this.forumService.create(domain, forumCreateDto));
  }

  @ApiOperation({operationId: 'getForum'})
  @ApiResponse({status: 200, description: 'Successful response', type: ActorDto})
  @ApiResponse({status: 404, description: 'Forum does not exist'})
  @Get(':forumname')
  public async findOne(@ServiceDomain() domainId: string, @Param() params: ForumParams): Promise<ActorDto> {
    const forum = await this.forumService.get(domainId, params.forumname);

    if (!forum) {
      throw new NotFoundException(`Forum ${params.forumname} not found.`);
      // @todo consider autocreating a forum if it doesn't exist
      // const tempForum = new ForumDto();
      // tempForum.id = `https://${serviceId}/forum/${params.pathId}`;
      // tempForum.name = `${params.pathId}`;
      // tempForum.summary = 'This forum has not been allocated yet.';
      // return tempForum;
    }

    return plainToClass(ActorDto, forum);
  }
}
