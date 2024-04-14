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
import { ObjectDto } from '../../../common/dto/object/object.dto';
import { UserService } from '../user.service';
import { OrderedCollectionPageDto } from '../../../common/dto/collection/ordered-collection-page.dto';
import { Reflector } from '@nestjs/core';
import { StoredObjectResolver } from 'src/modules/object/resolver/stored-object.resolver';
import { Link } from '@yuforium/activity-streams';

@UseInterceptors(
  new ClassSerializerInterceptor(new Reflector(), {
    groups: ['user-content'],
    excludeExtraneousValues: true
  })
)
@ApiTags('user')
@Controller('users/:username/content')
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
    type: 'UserContentQueryOptionsDto',
    style: 'deepObject',
    schema: {
      $ref: getSchemaPath(UserContentQueryOptionsDto)
    }
  })
  @ApiOkResponse({
    description: 'User content',
    type: OrderedCollectionPageDto
  })
  @Get()
  public async getContent(
    @ServiceDomain() domain: string,
    @Param() params: UserParamsDto,
    @Query('contentQuery') contentQuery: UserContentQueryOptionsDto
  ): Promise<OrderedCollectionPageDto> {
    const collectionPage = new OrderedCollectionPageDto();
    const userId = `https://${domain}/users/${params.username}`;

    this.logger.debug(`getContent() for user ${params.username}@${domain}`);

    const user = await this.userService.findOne(domain, params.username);

    if (!user) {
      this.logger.error(
        `getContent() user not found for ${params.username}@${domain}`
      );
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
      // domain,
      // attributedTo: userId,
      // type: contentQuery.type,
      $or: [{ _destination: person._id }, { _origination: person._id }]
    };

    const items = (await this.objectService.find(queryParams, contentQuery))
      .map(item => plainToInstance(ObjectDto, item));

    collectionPage.id = `${userId}/content`;
    collectionPage.items = items;
    collectionPage.totalItems = collectionPage.items.length;

    const resolveUsers = items
      .map((i: ObjectDto) => {
        if (i.attributedTo instanceof Link) {
          return i.attributedTo.resolve(this.resolver);
        }
        else {
          return Promise.resolve(i.attributedTo);
        }
      });

    await Promise.all(resolveUsers);

    return collectionPage;
  }

  @Get('posts/:postId')
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
