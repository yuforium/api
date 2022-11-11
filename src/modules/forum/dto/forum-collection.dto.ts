import { ActivityStreams, ASObject } from "@yuforium/activity-streams";
import { Expose, Type } from "class-transformer";
import { ForumDto } from "./forum.dto";

export class ForumCollectionDto extends ActivityStreams.collection('OrderedCollection') {
  static type: 'OrderedCollection';

  @Expose({name: 'items'})
  @Type(() => ForumDto)
  items: ASObject[] = [];
}