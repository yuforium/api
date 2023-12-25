import { Controller, Get, Logger, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ServiceDomain } from '../../../common/decorators/service-domain.decorator';
import { ObjectService } from '../../../modules/object/object.service';
import { ObjectDocument } from '../../../modules/object/schema/object.schema';
import { UserContentQueryOptionsDto } from '../dto/user-content-query-options.dto';
import { UserParamsDto } from '../dto/user-params.dto';
import { ObjectDto } from '../../../common/dto/object/object.dto';
import { UserService } from '../user.service';
import { OrderedCollectionPageDto } from '../../../common/dto/collection/ordered-collection-page.dto';

@ApiTags('user')
@Controller('users/:username/content')
export class UserContentController {
  protected readonly logger: Logger = new Logger(this.constructor.name);

  constructor(
    protected readonly objectService: ObjectService,
    protected readonly userService: UserService,
  ) { }

  @ApiParam({name: 'username', type: String, required: true, example: 'chris'})
  @ApiParam({name: 'pageNumber', type: Number, required: true, example: 1})
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
  @ApiOperation({operationId: 'getContent', summary: 'Get user content'})
  @ApiParam({name: 'username', type: String, required: true, example: 'chris'})
  @ApiExtraModels(UserContentQueryOptionsDto)
  @ApiQuery({
    name: 'contentQuery',
    required: false,
    type: 'UserContentQueryOptionsDto',
    style: 'deepObject',
    schema: {
      $ref: getSchemaPath(UserContentQueryOptionsDto)
    }})
  @ApiOkResponse({
    description: 'User content',
    type: OrderedCollectionPageDto
  })
  @Get()
  public async getContent(
    @ServiceDomain() domain: string,
    @Param() params: UserParamsDto,
    @Query('contentQuery') contentQuery: UserContentQueryOptionsDto):
  Promise<OrderedCollectionPageDto> {
    const collectionPage = new OrderedCollectionPageDto();
    const userId = `https://${domain}/users/${params.username}`;

    const user = await this.userService.findOne(domain, params.username);

    this.logger.debug(`getContent() for user ${params.username}@${domain}`);

    if (!user) {
      this.logger.error(`getContent() user not found ${params.username}@${domain}`);
      throw new NotFoundException();
    }

    const queryParams = {domain, attributedTo: userId, type: contentQuery.type};

    collectionPage.id = `${userId}/content`;
    collectionPage.items = (await this.objectService.find(queryParams, contentQuery))
      .map((item: ObjectDocument) => plainToInstance(ObjectDto, item));

    return collectionPage;
  }

  @Get('posts/:postId')
  @ApiParam({name: 'username', type: 'string', required: true, example: 'chris'})
  public async getPost(
    @ServiceDomain() _serviceId: string,
    @Param() params: UserParamsDto,
    @Param('postId') postId: string
  ): Promise<any> {
    return await this.objectService.getByPath(_serviceId, `users/${params.username}/posts`, postId);
  }
}