import { PartialType, PickType } from "@nestjs/swagger";
import { ActivityStreams, ASObject, Follow, IsRequired } from "@yuforium/activity-streams";

export class FollowCreateDto extends PartialType(
  PickType(Follow, ['id', 'name', 'type', 'actor', 'object']),
) {
  @IsRequired()
  object: ASObject | undefined;
}