import { Controller, Get, NotFoundException, Param, Query, ValidationPipe } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiParam, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ActivityStreams, OrderedCollectionPage } from '@yuforium/activity-streams';
import { plainToInstance } from 'class-transformer';
import { ServiceId } from '../../../common/decorators/service-id.decorator';
import { ObjectService } from 'src/modules/object/object.service';
import { ObjectDocument } from 'src/modules/object/schema/object.schema';
import { UserContentQueryOptionsDto } from '../dto/user-content-query-options.dto';
import { UserParamsDto } from '../dto/user-params.dto';
import { ObjectDto } from 'src/common/dto/object/object.dto';
import { UserService } from '../user.service';

@ApiTags('user')
@Controller('user/:username/content')
export class UserContentController {

  constructor(
    protected readonly objectService: ObjectService,
    protected readonly userService: UserService,
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

    const user = await this.userService.findOne(_serviceId, params.username);

    if (!user) {
      throw new NotFoundException();
    }

    collectionPage.id = `${userId}/content`;
    collectionPage.items = (await this.objectService.find({_serviceId, attributedTo: userId}, contentQuery))
      .map((item: ObjectDocument) => plainToInstance(ObjectDto, item));

    return collectionPage;
  }
}