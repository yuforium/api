import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ActivityStreams, OrderedCollectionPage } from '@yuforium/activity-streams-validator';
import { plainToInstance } from 'class-transformer';
import { ServiceId } from 'src/common/decorators/service-id.decorator';
import { ObjectService } from 'src/modules/object/object.service';
import { UserContentQueryDto } from '../dto/user-content-query.dto';
import { UserParamsDto } from '../dto/user-params.dto';

@ApiTags('user')
@Controller('user/:username/content')
export class ContentController {

  constructor(
    protected readonly objectService: ObjectService
  ) { }

  @Get()
  public async getContent(
    @ServiceId() _serviceId: string,
    @Param() params: UserParamsDto,
    @Query(undefined, new ValidationPipe({whitelist: true})) query: UserContentQueryDto):
  Promise<OrderedCollectionPage> {
    const collectionPage = new OrderedCollectionPage();
    const userId = `https://${_serviceId}/user/${params.username}`;

    collectionPage.id = `${userId}/content`;
    collectionPage.orderedItems = (await this.objectService.find({_serviceId, attributedTo: userId}))
      .map(item => plainToInstance(ActivityStreams.StreamObject, item));

    return collectionPage;
  }
}
