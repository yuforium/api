import { Controller, Get, Param, UseInterceptors, ClassSerializerInterceptor, NotFoundException, SerializeOptions } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { ObjectService } from '../../object/object.service';
import { ServiceId } from '../../../common/decorators/service-id.decorator';
import { ForumDto } from '../dto/forum.dto';
import { ForumCollectionDto } from '../dto/forum-collection.dto';
import { ForumParams } from '../dto/forum-params.dto';

@ApiTags('forums')
@Controller('forum')
// @UseInterceptors(ClassSerializerInterceptor)
// @SerializeOptions({excludeExtraneousValues: true})
export class ForumController {

  constructor(
    protected readonly objectService: ObjectService
  ) { }

  @Get()
  public async find() {
    const forums = await this.objectService.find({type: 'Forum'});
    const collection = new ForumCollectionDto();
    collection.items = forums.map(item => plainToClass(ForumDto, item));

    return collection;
  }

  @ApiResponse({status: 200, description: "Successful response"})
  @ApiResponse({status: 404, description: "Forum does not exist"})
  @Get(':pathId')
  public async get(@ServiceId() serviceId: string, @Param() params: ForumParams) {
    const forum = await this.objectService.get(`https://${serviceId}/forum/${params.pathId}`);

    if (!forum) {
      throw new NotFoundException();
    }

    return plainToClass(ForumDto, forum);
  }
}
