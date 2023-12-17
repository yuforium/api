import { Controller, Get, Param, UseInterceptors, ClassSerializerInterceptor, NotFoundException, SerializeOptions, Header, Post, NotImplementedException, Body } from '@nestjs/common';
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

@ApiTags('forum')
@Controller('forum')
export class ForumController {
  constructor(
    protected readonly forumService: ForumService,
    protected readonly objectService: ObjectService
  ) { }

  @ApiOperation({operationId: 'findForums'})
  @Get()
  @Header('Content-Type', 'application/activity+json')
  public async findForums() {
    const forums = await this.objectService.find({type: 'Forum'});
    const collection = new ForumCollectionDto();
    collection.items = forums.map((item: ObjectDocument) => plainToInstance(ForumDto, item));

    return collection;
  }

  // @ApiOperation({operationId: 'create'})
  @Post()
  @Header('Content-Type', 'application/activity+json')
  public async create(@ServiceDomain() serviceId: string, @Body() forumCreateDto: ForumCreateDto) {
    return plainToInstance(ForumDto, this.forumService.create(serviceId, forumCreateDto));
  }

  @ApiOperation({operationId: 'getForum'})
  @ApiResponse({status: 200, description: "Successful response", type: ForumDto})
  @ApiResponse({status: 404, description: "Forum does not exist"})
  @Get(':pathId')
  public async findOne(@ServiceDomain() serviceId: string, @Param() params: ForumParams): Promise<ForumDto> {
    const forum = await this.objectService.get(`https://${serviceId}/forum/${params.pathId}`);

    if (!forum) {
      const tempForum = new ForumDto();
      tempForum.id = `https://${serviceId}/forum/${params.pathId}`;
      tempForum.name = `${params.pathId}`;
      tempForum.summary = 'This forum has not been allocated yet.';
      return tempForum;
    }

    return plainToClass(ForumDto, forum);
  }
}
