import { Controller, Get, Logger, NotFoundException, Param, Query } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { ServiceDomain } from '../../../common/decorators/service-domain.decorator';
import { ForumService } from '../forum.service';
import { ForumParams } from '../dto/forum-params.dto';
import { OrderedCollectionPageDto } from 'src/common/dto/collection/ordered-collection-page.dto';
import { ContentQueryOptionsDto } from 'src/modules/object/dto/content-query-options.dto';
import { ObjectService } from 'src/modules/object/object.service';
import { plainToInstance } from 'class-transformer';
import { ObjectDto } from 'src/common/dto/object';
import { StoredObjectResolver } from 'src/modules/object/resolver/stored-object.resolver';

/**
 * Structure for the forum content controller response.
 *
 * ```json
 * {
 *   "id": "https://example.com/forums/1/content?page=1",
 *   "type": "OrderedCollectionPage",
 *   "items": [
 *      {
 *          "url": [
 *              "https://example.com/forums/1/content/1"
 *          ]
 *      }
 *   ]
 * }
 */
@ApiTags('forum')
@Controller('forums/:forumname/content')
export class ForumContentController {
  protected readonly logger: Logger = new Logger(this.constructor.name);

  constructor(
    protected readonly forumService: ForumService,
    protected readonly objectService: ObjectService,
    protected readonly resolver: StoredObjectResolver
  ) { }

  @ApiOperation({operationId: 'getForumContent', summary: 'Get forum content'})
  @ApiParam({name: 'forumname', type: String, required: true, example: 'test-forum'})
  @ApiExtraModels(ContentQueryOptionsDto, OrderedCollectionPageDto)
  @ApiQuery({
    name: 'contentQuery',
    required: false,
    type: 'ContentQueryOptionsDto',
    style: 'deepObject',
    schema: {
      $ref: getSchemaPath(ContentQueryOptionsDto)
    }
  })
  @ApiOkResponse({description: 'Forum content', type: OrderedCollectionPageDto})
  @Get()
  public async getPosts(
    @ServiceDomain() domain: string,
    @Param() params: ForumParams,
    @Query('contentQuery') query: ContentQueryOptionsDto
  ): Promise<any> {
    const collectionPage = new OrderedCollectionPageDto();
    const forumId = `https://${domain}/forums/${params.forumname}`;

    query = query || new ContentQueryOptionsDto();

    this.logger.debug(`getContent for forum ${params.forumname}@${domain}`);

    const forum = await this.objectService.findById(forumId);

    if (!forum) {
      this.logger.error(`getContent() forum not found for ${params.forumname}@${domain}`);
      throw new NotFoundException();
    }

    const queryParams = {
      $or: [
        {'_attribution._id': forum._id, '_attribution.rel': 'attributedTo', '_public': true},
        {'_attribution._id': forum._id, '_attribution.rel': 'to', '_public': true}
      ]
    }

    const opts = {
      skip: query.skip,
      limit: query.limit,
      sort: query.sort,
    };

    // const posts = await this.forumService.getContent(domain, params.forumname, opts);

    const {data, totalItems} = await this.objectService.findPageWithTotal(queryParams, opts);
    const items = data.map(item => plainToInstance(ObjectDto, item));

    await this.objectService.resolveFields(items, 'attributedTo');

    Object.assign(collectionPage, {
      items,
      totalItems: totalItems
    })

    collectionPage.id = `https://${domain}/forums/${params.forumname}/content/page/1`;

    /**
     * @todo it is questionable whether or not we should allow a page size
     * param, because it affects the pagination of the forum content, and
     * therefore the ID that would be returned by this endpoint.  That
     * being said, if the `size` param matches the default page size,
     * return a URL that would match the default page size.
     */
    const page = Object.assign(new OrderedCollectionPageDto(), {
      id: `https://${domain}/forums/${params.forumname}/content/page/1`,
      items
    });

    return page;
  }
}
