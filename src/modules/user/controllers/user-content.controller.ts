import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiParam, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ActivityStreams, OrderedCollectionPage } from '@yuforium/activity-streams-validator';
import { plainToInstance } from 'class-transformer';
import { ServiceId } from 'src/common/decorators/service-id.decorator';
import { ObjectService } from 'src/modules/object/object.service';
import { ObjectDocument } from 'src/modules/object/schema/object.schema';
import { UserContentQueryOptionsDto } from '../dto/user-content-query-options.dto';
import { UserParamsDto } from '../dto/user-params.dto';

@ApiTags('user')
@Controller('user/:username/content')
export class UserContentController {

  constructor(
    protected readonly objectService: ObjectService
  ) { }

  /**
   * Get user's content
   * @param _serviceId
   * @param params
   * @param options
   * @returns
   */
  @ApiOperation({operationId: 'getContent'})
  @ApiParam({name: 'username', type: 'string', required: true, example: 'chris'})
  @ApiExtraModels(UserContentQueryOptionsDto)
  @ApiQuery({
    name: 'contentQuery',
    required: false,
    type: 'UserContentQueryOptionsDto',
    style: 'deepObject',
    schema: {
      $ref: getSchemaPath(UserContentQueryOptionsDto)
    }})
  @Get()
  public async getContent(
    @ServiceId() _serviceId: string,
    @Param() params: UserParamsDto,
    @Query('contentQuery') contentQuery: UserContentQueryOptionsDto):
  Promise<OrderedCollectionPage> {
    const collectionPage = new OrderedCollectionPage();
    const userId = `https://${_serviceId}/user/${params.username}`;

    collectionPage.id = `${userId}/content`;
    collectionPage.orderedItems = (await this.objectService.find({_serviceId, attributedTo: userId}, contentQuery))
      .map((item: ObjectDocument) => plainToInstance(ActivityStreams.StreamObject, item));

    return collectionPage;
  }
}