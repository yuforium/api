import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ActivityStreams, Link } from '@yuforium/activity-streams';
import { ObjectDto } from '../object';

@ApiExtraModels(ObjectDto, Link)
export class OrderedCollectionPageDto extends ActivityStreams.collectionPage('OrderedCollectionPage') {
  static type = 'OrderedCollectionPage';

  @ApiProperty({type: 'integer'})
  public totalItems!: number;

  @ApiProperty({type: [ObjectDto]})
  public items!: (string | ObjectDto | Link)[];
}
