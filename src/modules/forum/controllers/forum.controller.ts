import { Controller, Get, Param, NotFoundException, Header, Post, Body } from '@nestjs/common';
import { ApiExtraModels, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
import { ObjectType } from 'src/modules/object/type/object.type';
import { ObjectDto } from 'src/common/dto/object';

@ApiTags('forum')
@Controller('forums')
export class ForumController {
  constructor(
    protected readonly objectService: ObjectService
  ) { }

  @ApiOperation({operationId: 'findForums', summary: 'Find forums'})
  @Get()
  @Header('Content-Type', 'application/activity+json')
  public async findForums(@ServiceDomain() _domain: string) {
    const forums = await this.objectService.find({type: 'Forum', _domain});
    const collection = new ForumCollectionDto();
    collection.items = forums.map((item: ObjectDocument) => plainToInstance(ForumDto, item));

    return collection;
  }

  @ApiOperation({operationId: 'createForum', summary: 'Create a forum'})
  @Post()
  @Header('Content-Type', 'application/activity+json')
  public async create(@ServiceDomain() domain: string, @Body() forumCreateDto: ForumCreateDto): Promise<ActorDto | ObjectDto> {
    const forum = await this.objectService.create({
      ...forumCreateDto,
      '@context': [
        'https://www.w3.org/ns/activitystreams',
        'https://w3id.org/security/v1',
        'https://yuforium.org/ns/activitystreams'
      ],
      id: `https://${domain}/forums/${forumCreateDto.name}`,
      type: ['Service', 'Forum']
    });

    return forum;
  }

  @ApiOperation({operationId: 'getForum', summary: 'Get a forum'})
  @ApiOkResponse({status: 200, description: 'Forum found', type: ActorDto})
  @ApiNotFoundResponse({status: 404, description: 'Forum not found'})
  @ApiExtraModels(ActorDto)
  @Get(':forumname')
  @Header('Content-Type', 'application/activity+json')
  public async findOne(
    @ServiceDomain() domainId: string,
    @Param() params: ForumParams
  ): Promise<ActorDto> {
    const id = `https://${domainId}/forums/${params.forumname}`;
    const forum = await this.objectService.get(id);

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
