import { Collection } from "@yuforium/activity-streams-validator";
import { Expose, Type } from "class-transformer";
import { ForumDto } from "./forum.dto";

export class ForumCollectionDto extends Collection {
  @Expose({name: 'items'})
  @Type(() => ForumDto)
  items: ForumDto[];
}