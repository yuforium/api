import { ApiProperty } from '@nestjs/swagger';
import { ASLink, ASObject, ActivityStreams } from '@yuforium/activity-streams';
import { ObjectDto } from '../object';

export class OrderedCollectionPageDto extends ActivityStreams.collectionPage('OrderedCollectionPage') {
  static type = 'OrderedCollectionPage';

  @ApiProperty({type: [ObjectDto]})
  items!: (string | ASObject | ASLink)[];
}