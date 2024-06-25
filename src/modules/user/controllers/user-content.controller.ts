import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  Logger,
  NotFoundException,
  NotImplementedException,
  Param,
  Query,
  UseInterceptors
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  getSchemaPath
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ServiceDomain } from '../../../common/decorators/service-domain.decorator';
import { ObjectService } from '../../../modules/object/object.service';
import { UserContentQueryOptionsDto } from '../dto/user-content-query-options.dto';
import { UserParamsDto } from '../dto/user-params.dto';
import { ObjectDto } from '../../object/dto/object.dto';
import { UserService } from '../user.service';
import { OrderedCollectionPageDto } from '../../object/dto/collection/ordered-collection-page.dto';
import { Reflector } from '@nestjs/core';
import { ContentQueryOptionsDto } from '../../object/dto/content-query-options.dto';
import { StoredObjectResolver } from '../../object/resolver/stored-object.resolver';

@UseInterceptors(
  new ClassSerializerInterceptor(new Reflector(), {
    groups: ['user-content'],
    excludeExtraneousValues: true
  })
)
@ApiTags('user')
@Controller('users/:username/posts')
export class UserContentController {
  protected readonly logger: Logger = new Logger(this.constructor.name);

  constructor(
    protected readonly objectService: ObjectService,
    protected readonly userService: UserService,
    protected readonly resolver: StoredObjectResolver
  ) { }

  @ApiParam({
    name: 'username',
    type: String,
    required: true,
    example: 'chris'
  })
  @ApiParam({ name: 'pageNumber', type: Number, required: true, example: 1 })
  @Get('page/:pageNumber')
  public async getContentPage(@Query('pageNumber') _pageNumber: number) {
    throw new NotImplementedException();
  }

  /**
   * Get user's content
   * @param _serviceId
   * @param params
   * @param options
   * @returns
   */
  @ApiOperation({ operationId: 'getContent', summary: 'Get user content' })
  @ApiParam({
    name: 'username',
    type: String,
    required: true,
    example: 'chris'
  })
  @ApiExtraModels(UserContentQueryOptionsDto, OrderedCollectionPageDto)
  @ApiQuery({
    name: 'contentQuery',
    required: false,
    type: 'ContentQueryOptionsDto',
    style: 'deepObject',
    schema: {
      $ref: getSchemaPath(ContentQueryOptionsDto)
    }
  })
  @ApiOkResponse({
    description: 'User content',
    type: OrderedCollectionPageDto
  })
  @Get()
  public async getPosts(
    @ServiceDomain() domain: string,
    @Param() params: UserParamsDto,
    @Query('contentQuery') contentQuery: ContentQueryOptionsDto
  ): Promise<OrderedCollectionPageDto | any> {
    const collectionPage = new OrderedCollectionPageDto();
    const userId = `https://${domain}/users/${params.username}`;

    contentQuery = contentQuery || new ContentQueryOptionsDto();

    this.logger.debug(`getContent() for user ${params.username}@${domain}`);

    const user = await this.userService.findOne(domain, params.username);

    if (!user) {
      this.logger.debug(`getContent() user not found for ${params.username}@${domain}`);
      throw new NotFoundException();
    }

    const person = await this.objectService.findOne({
      _domain: domain,
      _id: user.defaultIdentity
    });

    if (!person) {
      this.logger.error(`getContent() user default identity not found for ${params.username}@${domain}`);
      throw new NotFoundException();
    }

    const queryParams = {
      inReplyTo: null,
      $or: [
        {'_attribution.id': person.id, '_attribution.rel': 'attributedTo', '_public': true},
        {'_attribution.id': person.id, '_attribution.rel': 'to', '_public': true}
      ]
    };

    // const scratch = await this.objectService.findById('https://localhost/forums/scratch');
    // return scratch;

    const {data, totalItems: total} = await this.objectService.findPageWithTotal(queryParams, contentQuery);

    const items = data.map((item: any) => {
      console.log(item);
      return plainToInstance(ObjectDto, item);
    });

    collectionPage.id = `${userId}/content`;
    collectionPage.items = items;
    collectionPage.totalItems = total; //collectionPage.items.length;

    await Promise.all(items.map(item => this.objectService.resolveFields(item, ['attributedTo', 'audience'])));

    return collectionPage;
  }

  @Get(':postId')
  @ApiParam({
    name: 'username',
    type: 'string',
    required: true,
    example: 'chris'
  })
  public async getPost(
    @ServiceDomain() _serviceId: string,
    @Param() params: UserParamsDto,
    @Param('postId') postId: string
  ): Promise<any> {
    return await this.objectService.getByPath(
      _serviceId,
      `users/${params.username}/posts`,
      postId
    );
  }
}
