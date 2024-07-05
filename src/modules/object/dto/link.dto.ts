import { ActivityStreams, ASLink } from '@yuforium/activity-streams';
import { Expose } from 'class-transformer';

export class LinkDto extends ActivityStreams.link('Link') implements ASLink {
  @Expose()
    type = 'Link';

  @Expose()
    href!: string;

  toValue() {
    return this.href;
  }
}