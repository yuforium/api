import { PartialType, PickType } from "@nestjs/swagger";
import { ActivityStreams, Follow, IsRequired } from "@yuforium/activity-streams-validator";

export class FollowCreateDto extends PartialType(
  PickType(Follow, ['id', 'name', 'type', 'actor', 'object']),
) {
  @IsRequired()
  object: ActivityStreams.StreamObject | undefined;
}