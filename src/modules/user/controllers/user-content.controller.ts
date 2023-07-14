import { Controller, Get, Logger, NotFoundException, Param, Query, ValidationPipe } from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiParam, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ActivityStreams, OrderedCollectionPage } from '@yuforium/activity-streams';
import { plainToInstance } from 'class-transformer';
import { ServiceId } from '../../../common/decorators/service-id.decorator';
import { ObjectService } from '../../../modules/object/object.service';
import { ObjectDocument } from '../../../modules/object/schema/object.schema';
import { UserContentQueryOptionsDto } from '../dto/user-content-query-options.dto';
import { UserParamsDto } from '../dto/user-params.dto';
import { ObjectDto } from '../../../common/dto/object/object.dto';
import { UserService } from '../user.service';

@ApiTags('user')
@Controller('users/:username/content')
export class UserContentController {
  protected readonly logger: Logger = new Logger(this.constructor.name);

  constructor(
    protected readonly objectService: ObjectService,
    protected readonly userService: UserService,
  ) { }

  @Get('page/:pageNumber')
  public async getContentPage(@Query('pageNumber') pageNumber: number) {
    console.log(pageNumber);

  }

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
    const userId = `https://${_serviceId}/users/${params.username}`;

    const user = await this.userService.findOne(_serviceId, params.username);

    this.logger.log(`getContent(): User: ${params.username}`);

    if (!user) {
      this.logger.log(`getContent(): User not found: ${params.username}`);
      throw new NotFoundException();
    }

    collectionPage.id = `${userId}/content`;
    collectionPage.items = (await this.objectService.find({_serviceId, attributedTo: userId}, contentQuery))
      .map((item: ObjectDocument) => plainToInstance(ObjectDto, item));

    return collectionPage;
  }

  @Get('posts/:postId')
  @ApiParam({name: 'username', type: 'string', required: true, example: 'chris'})
  public async getPost(
    @ServiceId() _serviceId: string,
    @Param() params: UserParamsDto,
    @Param('postId') postId: string
  ): Promise<any> {
    return await this.objectService.getByPath(_serviceId, `users/${params.username}/posts`, postId);
  }
}