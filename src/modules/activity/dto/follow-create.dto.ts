import { PartialType, PickType } from "@nestjs/swagger";
import { Follow, IsRequired } from "@yuforium/activity-streams-validator";

export class FollowCreateDto extends PartialType(
  PickType(Follow, ['id', 'name', 'type', 'actor', 'object']),
) {
  @IsRequired()
  object;
}