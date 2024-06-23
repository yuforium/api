import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { ActivityStreams, Link } from '@yuforium/activity-streams';
import { ObjectDto } from '../object.dto';

@ApiExtraModels(ObjectDto, Link)
export class OrderedCollectionPageDto extends ActivityStreams.collectionPage('OrderedCollectionPage') {
  static type = 'OrderedCollectionPage';

  @ApiProperty({type: 'integer'})
  public totalItems!: number;

  @ApiProperty({type: [ObjectDto]})
  public items!: (string | ObjectDto | Link)[];
}
