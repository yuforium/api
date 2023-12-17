import { Controller, Get } from '@nestjs/common';

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
@Controller('forum-content')
export class ForumContentController {
  @Get()
  public async getForumContent() {
    return {
      id: 'https://example.com/forums/1/content?page=1',
      type: 'OrderedCollectionPage',
      items: [
        {
          url: [
            'https://example.com/forums/1/content/1',
          ],
        },
      ],
    };
  }
}
