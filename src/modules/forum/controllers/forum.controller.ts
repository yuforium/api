import { Controller, Get, Param, UseInterceptors, ClassSerializerInterceptor, NotFoundException, SerializeOptions, Header, Post, NotImplementedException, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToClass, plainToInstance } from 'class-transformer';
import { ObjectService } from '../../object/object.service';
import { ServiceId } from '../../../common/decorators/service-id.decorator';
import { ForumDto } from '../dto/forum.dto';
import { ForumCollectionDto } from '../dto/forum-collection.dto';
import { ForumParams } from '../dto/forum-params.dto';
import { ForumService } from '../forum.service';
import { ForumCreateDto } from 'src/common/dto/forum-create.dto';
import { ObjectDocument } from 'src/modules/object/schema/object.schema';

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
  public async create(@ServiceId() serviceId: string, @Body() forumCreateDto: ForumCreateDto) {
    return plainToInstance(ForumDto, this.forumService.create(serviceId, forumCreateDto));
  }

  @ApiOperation({operationId: 'getForum'})
  @ApiResponse({status: 200, description: "Successful response"})
  @ApiResponse({status: 404, description: "Forum does not exist"})
  @Get(':pathId')
  public async findOne(@ServiceId() serviceId: string, @Param() params: ForumParams) {
    const forum = await this.objectService.get(`https://${serviceId}/forum/${params.pathId}`);

    if (!forum) {
      const tempForum = new ForumDto();
      tempForum.id = `https://${serviceId}/forum/${params.pathId}`;
      tempForum.name = 'Unallocated Forum';
      return tempForum;
      // throw new NotFoundException();
    }

    return plainToClass(ForumDto, forum);
  }
}
