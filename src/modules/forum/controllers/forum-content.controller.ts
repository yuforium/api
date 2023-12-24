import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { OrderedCollectionPage } from '@yuforium/activity-streams';
import { ServiceDomain } from 'src/common/decorators/service-domain.decorator';
import { ObjectService } from 'src/modules/object/object.service';

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
@Controller('forums/:pathId/content')
export class ForumContentController {
  protected readonly logger: Logger = new Logger(this.constructor.name);

  constructor(
    protected readonly objectService: ObjectService,
  ) { }

  @ApiOperation({operationId: 'getForumContent', summary: 'Get forum content'})
  @ApiParam({name: 'pathId', type: String, required: true, example: '1'})
  @Get()
  public async getForumContent(
    @ServiceDomain() domain: string
  ) {
    this.logger.debug('get forum content');

    const posts = this.objectService.find({_destination: `https://${domain}/forums/1`});

    const page = new OrderedCollectionPage();
    return {
      id: 'https://example.com/forums/1/content?page=1',
      type: 'OrderedCollectionPage',
      items: [
        {
          url: [
            'https://example.com/forums/1/content/1',
          ],
        },
        {
          url: [
            'https://example.com/forums/1/content/2',
          ],
        }
      ],
    };
  }
}
